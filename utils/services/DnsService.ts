import { MongoClient } from 'mongodb';
import { getCurrentIp, updateRecords } from 'godaddy-dns';
import { LogEvent } from '../types/LogEntry';
import { LogService } from './LogService';
import Greenlock from 'greenlock';
import fs from 'fs';
import path from 'path';
import pkg from '../../package.json';

export class DnsService {
  private key: string | null;
  private secret: string | null;
  private hostname: string | null;

  private isLoggedIn: boolean;

  private refreshTimer?: ReturnType<typeof setTimeout>;
  private lastRefreshIP?: string;

  private greenlock: any;

  private constructor() {
    this.key = null;
    this.secret = null;
    this.hostname = null;
    this.isLoggedIn = false;
    this.greenlock = Greenlock.create({
      packageRoot: process.cwd(),
      configDir: './greenlock.d',
      packageAgent: pkg.name + '/' + pkg.version,
      maintainerEmail: pkg.author.email,
      subscriberEmail: pkg.author.email,
      staging: process.env.NODE_ENV !== 'production',
      notify: (event: string, details: any) => {
        if ('error' === event) {
          // `details` is an error object in this case
          console.error(details);
        }
      }
    });
    this.loadDNS();
  }

  /**
   * Loads the DNS settings from the local MongoDB instance and logs in to GoDaddy.
   */
  private loadDNS = async () => {
    const client = await MongoClient.connect(`mongodb://${process.env.MONGODB_URI}`);
    const db = client.db();
    const settings = await db.collection('settings').findOne();
    if (settings) {
      this.key = settings.dnsApiKey ?? null;
      this.hostname = settings.dnsHostname ?? null;
      this.secret = settings.dnsApiSecret ?? null;
      if (this.key && this.hostname && this.secret) {
        // All credentials are saved. Attempt to login to GoDaddy
        this.login();
      }
    }
  };

  /**
   * Get the Singleton instance of this class
   * @returns The singleton instance
   */
  public static getInstance(): DnsService {
    if (!global.dnsServiceInstance) global.dnsServiceInstance = new DnsService();
    return global.dnsServiceInstance;
  }

  /**
   * Logs-in to GoDaddy.
   * @param newLogin If this is a new login or not
   * @param key The API key
   * @param secret The API secret key
   * @param hostname The hostname
   */
  private async login(
    newLogin: boolean = false,
    key: string = this.key ?? '',
    secret: string = this.secret ?? '',
    hostname: string = this.hostname ?? ''
  ) {
    const currentIp = await getCurrentIp();
    if (newLogin || this.lastRefreshIP === undefined || this.lastRefreshIP !== currentIp) {
      this.lastRefreshIP = currentIp;
      await updateRecords(currentIp, {
        apiKey: key,
        secret: secret,
        domain: hostname,
        records: [{ type: 'A', name: '@', ttl: 3600 }]
      });
      LogService.getInstance().addEntry(LogEvent.DNS_UPDATE, { data: JSON.stringify({ ip: currentIp, hostname }) });
      this.isLoggedIn = true;
      this.setCertificateTimer();
    }
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(this.login, 3600000);
  }

  private setCertificateTimer() {
    // JavaScript limits timers to 32-bit integers, which only allows for ~25 day timers.
    // Greenlock gives certificates valid for ~90 days.
    const MAX_TIMER_LENGTH = 2147483647;
    if (global.certificateRefreshTime > MAX_TIMER_LENGTH) {
      setTimeout(() => {
        global.certificateRefreshTime -= MAX_TIMER_LENGTH;
        this.setCertificateTimer();
      }, MAX_TIMER_LENGTH);
    } else setTimeout(() => this.getNewCertificates(), global.certificateRefreshTime);
  }

  /**
   * Handles a new login to GoDaddy
   * @param key The API key
   * @param secret The API secret key
   * @param hostname The hostname
   */
  public async newLogin(key: string, secret: string, hostname: string) {
    await this.login(true, key, secret, hostname);
    const client = await MongoClient.connect(`mongodb://${process.env.MONGODB_URI}`);
    const db = client.db();
    await db
      .collection('settings')
      .updateOne({}, { $set: { dnsHostname: hostname, dnsApiKey: key, dnsApiSecret: secret } }, { upsert: true });
    this.key = key;
    this.secret = secret;
    this.hostname = hostname;
    this.deleteOldCertificates();
  }

  /**
   * Gets the currently loaded API key.
   * @returns The API key
   */
  public getKey() {
    return this.key;
  }

  /**
   * Gets the currently loaded secret key.
   * @returns The secret key
   */
  public getSecret() {
    return this.secret;
  }

  /**
   * Gets the currently loaded hostname.
   * @returns The hostname
   */
  public getHostname() {
    return this.hostname;
  }

  /**
   * Gets if the system is logged in to GoDaddy.
   * @returns The login state
   */
  public getIsLoggedIn() {
    return this.isLoggedIn;
  }

  /**
   * Gets if the server is running on HTTPS.
   * @returns The HTTPS running state
   */
  public getIsRunningHttps() {
    return global.httpsStarted ?? false;
  }

  /**
   * Deletes all certificate information except for the configured hostname's.
   */
  private deleteOldCertificates() {
    const certsDirectory = '.config/greenlock/live/';
    const certs = fs.readdirSync(certsDirectory);
    certs.forEach(async cert => {
      // Delete everything but the configured hostname
      if (cert === this.hostname) return;
      // TODO: Investigate removeing. This may not remove from './greenlock.d/config.json'
      await this.greenlock.remove({ subject: cert });
      const folderPath = path.join(certsDirectory, cert);
      const folderContents = fs.readdirSync(folderPath);
      folderContents.forEach(file => fs.unlinkSync(path.join(folderPath, file)));
      fs.rmdirSync(folderPath);
    });
  }

  /**
   * Gets new certificates and restarts the HTTPS server.
   * @throws Error when unable to get new certificates
   */
  public async getNewCertificates() {
    try {
      if (!this.isLoggedIn) throw new Error('DNS Login must be configured first');

      await this.greenlock.add({
        subject: this.hostname,
        altnames: [this.hostname],
        agreeToTerms: true,
        subscriberEmail: pkg.author.email,
        staging: true,
        store: {
          module: 'greenlock-store-fs',
          basePath: process.cwd() + '/.config/greenlock'
        },
        challenges: {
          'dns-01': {
            module: 'acme-dns-01-godaddy',
            key: this.key,
            secret: this.secret
          }
        }
      });

      const { pems } = await this.greenlock.get({ servername: this.hostname });
      if (pems && pems.privkey && pems.cert && pems.chain) {
        global.startHttps();
        LogService.getInstance().addEntry(LogEvent.CERTIFICATES, {});
        this.setCertificateTimer();
      } else throw new Error('Unable to retreive certificates');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

// Load the service immideately
DnsService.getInstance();

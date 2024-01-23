import { getCurrentIp, updateRecords } from 'godaddy-dns';
import Greenlock from 'greenlock';
import fs from 'fs';
import path from 'path';
import { LogEvent } from 'enums';
import { DatabaseService, LogService, WebSocketService } from 'services';
import pkg from '../../package.json';

export class DnsService {
  private key: string | null;
  private secret: string | null;
  private hostname: string | null;

  private isLoggedIn: boolean;

  private refreshTimer?: ReturnType<typeof setTimeout>;
  private lastRefreshIP?: string;

  private greenlock: any;

  private isLoggingIn: boolean;
  private isGettingCertificates: boolean;

  private dnsLockout: number | null;

  private constructor() {
    this.key = null;
    this.secret = null;
    this.hostname = null;
    this.dnsLockout = null;
    this.isLoggedIn = false;
    this.isLoggingIn = false;
    this.isGettingCertificates = false;
    this.greenlock = Greenlock.create({
      packageRoot: process.cwd(),
      configDir: './greenlock.d',
      packageAgent: pkg.name + '/' + pkg.version,
      maintainerEmail: pkg.author.email,
      subscriberEmail: pkg.author.email,
      staging: process.env.NODE_ENV === 'development',
      notify: (event: string, details: any) => {
        if ('error' === event) {
          // `details` is an error object in this case
          console.error(details);
        }
      },
    });
    this.loadDNS().catch(console.error);
  }

  /**
   * Loads the DNS settings from the local MongoDB instance and logs in to GoDaddy.
   */
  private async loadDNS() {
    const client = await DatabaseService.getInstance().getClientAsync();
    const settings = await client.collection('settings').findOne();
    if (settings) {
      const dnsLockout = settings.dnsLockout ?? null;
      // If the lockout time is in the future, set it to the ms until the lockout
      if (new Date(dnsLockout) > new Date()) this.dnsLockout = new Date(dnsLockout).valueOf() - new Date().valueOf();
      this.key = settings.dnsApiKey ?? null;
      this.hostname = settings.dnsHostname ?? null;
      this.secret = settings.dnsApiSecret ?? null;
      if (this.key && this.hostname && this.secret) {
        // All credentials are saved. Attempt to login to GoDaddy
        await this.login();
      }
    }
  }

  /**
   * Get the Singleton instance of this class
   * @returns The singleton instance
   */
  public static getInstance(): DnsService {
    if (!global.dnsServiceInstance) global.dnsServiceInstance = new DnsService();
    return global.dnsServiceInstance;
  }

  /**
   * Creates a new instance of this class. Should only be used in development.
   */
  public getNewInstance() {
    return new DnsService();
  }

  /**
   * Gets if the system is currently configuring DNS.
   */
  public getIsLoggingIn() {
    return this.isLoggingIn;
  }

  /**
   * Gets if the system is currently getting certificates.
   */
  public getIsGettingCertificates() {
    return this.isGettingCertificates;
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
    hostname: string = this.hostname ?? '',
  ) {
    if (this.isLoggingIn) throw new Error('Already configuring DNS');
    this.isLoggingIn = true;
    WebSocketService.getInstance().emitMessage('DNS_LOGIN');
    try {
      const currentIp = await getCurrentIp();
      if (newLogin || this.lastRefreshIP === undefined || this.lastRefreshIP !== currentIp) {
        this.lastRefreshIP = currentIp;
        await updateRecords(currentIp, {
          apiKey: key,
          secret: secret,
          domain: hostname,
          records: [{ type: 'A', name: '@', ttl: 3600 }],
        });
        LogService.getInstance().addEntry(LogEvent.DNS_UPDATE, {
          data: JSON.stringify({ ip: currentIp, hostname }),
        });
        this.isLoggedIn = true;
        this.setCertificateTimer();
      }
      if (this.refreshTimer) clearTimeout(this.refreshTimer);
      this.refreshTimer = setTimeout(() => {
        this.login().catch(console.error);
      }, 3600000);
      this.isLoggingIn = false;
      WebSocketService.getInstance().emitMessage('DNS_LOGIN_COMPLETE', true);
    } catch (error) {
      this.isLoggingIn = false;
      WebSocketService.getInstance().emitMessage('DNS_LOGIN_COMPLETE', this.isLoggedIn);
      throw error;
    }
  }

  private setCertificateTimer() {
    // JavaScript limits timers to 32-bit integers, which only allows for ~25 day timers.
    // Greenlock gives certificates valid for ~90 days.
    const MAX_TIMER_LENGTH = 2147483647;
    // If the DNS lockout is set, use that as the timer
    if (this.dnsLockout) global.certificateRefreshTime = this.dnsLockout;
    if (global.certificateRefreshTime > MAX_TIMER_LENGTH) {
      setTimeout(() => {
        global.certificateRefreshTime -= MAX_TIMER_LENGTH;
        this.setCertificateTimer();
      }, MAX_TIMER_LENGTH);
    } else
      setTimeout(() => {
        if (this.dnsLockout) {
          const client = DatabaseService.getInstance().getClient();
          client.collection('settings').updateOne({}, { $set: { dnsLockout: null } }, { upsert: true });
          this.dnsLockout = null;
        }
        this.getNewCertificates().catch(console.error);
      }, global.certificateRefreshTime);
  }

  /**
   * Handles a new login to GoDaddy
   * @param key The API key
   * @param secret The API secret key
   * @param hostname The hostname
   */
  public async newLogin(key: string, secret: string, hostname: string) {
    await this.login(true, key, secret, hostname);
    const client = await DatabaseService.getInstance().getClientAsync();
    await client
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
    certs.forEach(cert => {
      // Delete everything but the configured hostname
      if (cert === this.hostname) return;
      // TODO: Investigate removing. This may not remove from './greenlock.d/config.json'
      this.greenlock.remove({ subject: cert }).catch(console.error);
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
    if (this.dnsLockout !== null) {
      const dnsLockoutDate = new Date(new Date().valueOf() + this.dnsLockout);
      throw new Error(`DNS is locked out until ${dnsLockoutDate}`);
    }
    if (this.isGettingCertificates) throw new Error('Already getting certificates');
    this.isGettingCertificates = true;
    WebSocketService.getInstance().emitMessage('GETTING_CERTIFICATES');
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
          basePath: process.cwd() + '/.config/greenlock',
        },
        challenges: {
          'dns-01': {
            module: 'acme-dns-01-godaddy',
            key: this.key,
            secret: this.secret,
          },
        },
      });

      const { pems } = await this.greenlock.get({ servername: this.hostname });
      if (pems?.privkey && pems.cert && pems.chain) {
        global.startHttps();
        LogService.getInstance().addEntry(LogEvent.CERTIFICATES, {});
        this.setCertificateTimer();
      } else throw new Error('Unable to retreive certificates');
      this.isGettingCertificates = false;
      WebSocketService.getInstance().emitMessage('GETTING_CERTIFICATES_COMPLETE', true);
    } catch (error) {
      const errorT = error as {
        message: string;
        context: string;
        subject: string;
        altname: string;
        // eslint-disable-next-line no-unused-vars
        toJSON: (e: unknown) => Object;
        servername: string;
        _site: {
          subject: string;
          altnames: string[];
          renewAt: string;
          agreeToTerms: boolean;
          subscriberEmail: string;
          staging: boolean;
          store: {
            module: string;
            basePath: string;
          };
          challenges: unknown;
        };
      };
      const errorDetails = JSON.parse(errorT.message.split('\n')[1]) as {
        type: string;
        detail: string;
        status: number;
      };
      if (errorDetails.status === 429) {
        const startIndex = errorDetails.detail.indexOf('retry after') + 12;
        // Set the lockout time to 5 minutes after the retry time
        const dnsLockout = new Date(errorDetails.detail.substring(startIndex, startIndex + 20)).valueOf() + 300000;
        this.dnsLockout = dnsLockout;
        const client = DatabaseService.getInstance().getClient();
        await client.collection('settings').updateOne({}, { $set: { dnsLockout } }, { upsert: true });
      }
      this.isGettingCertificates = false;
      WebSocketService.getInstance().emitMessage('GETTING_CERTIFICATES_COMPLETE', this.getIsRunningHttps());
      throw error;
    }
  }
}

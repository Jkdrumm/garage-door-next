import { MongoClient } from 'mongodb';
import { getCurrentIp, updateRecords } from 'godaddy-dns';
import { LogEvent } from '../types/LogEntry';
import { LogService } from './LogService';

export class DnsService {
  private key: string | null;
  private secret: string | null;
  private hostname: string | null;

  private isLoggedIn: boolean;

  private refreshTimer?: ReturnType<typeof setTimeout>;
  private lastRefreshIP?: string;

  private constructor() {
    this.key = null;
    this.secret = null;
    this.hostname = null;
    this.isLoggedIn = false;
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
      this.isLoggedIn = true;
    }
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(this.login, 3600000);
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
    await LogService.getInstance().addEntry(LogEvent.DNS_UPDATE, {});
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
}

// Load the service immideately
DnsService.getInstance();

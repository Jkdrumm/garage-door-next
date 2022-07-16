import { MongoClient } from 'mongodb';
import { getCurrentIp, updateRecords } from 'godaddy-dns';
import { LogEvent } from '../types/LogEntry';
import { LogService } from './LogService';

export class DnsService {
  private static instance: DnsService;

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

  private loadDNS = async () => {
    const client = await MongoClient.connect(`${process.env.MONGODB_URI}`);
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

  public static getInstance(): DnsService {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (process.env.NODE_ENV === 'development') {
      const global = globalThis as any;
      if (!global.dnsServiceInstance) global.dnsServiceInstance = new DnsService();
      return global.dnsServiceInstance;
    }

    if (!this.instance) this.instance = new DnsService();
    return this.instance;
  }

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

  public async newLogin(key: string, secret: string, hostname: string) {
    try {
      await this.login(true, key, secret, hostname);
      const client = await MongoClient.connect(`${process.env.MONGODB_URI}`);
      const db = client.db();
      await db
        .collection('settings')
        .updateOne({}, { $set: { dnsHostname: hostname, dnsApiKey: key, dnsApiSecret: secret } }, { upsert: true });
      this.key = key;
      this.secret = secret;
      this.hostname = hostname;
      await LogService.getInstance().addEntry(LogEvent.DNS_UPDATE, {});
    } catch (error) {
      throw error;
    }
  }

  public getKey() {
    return this.key;
  }

  public getSecret() {
    return this.secret;
  }

  public getHostname() {
    return this.hostname;
  }

  public getIsLoggedIn() {
    return this.isLoggedIn;
  }

  public getIsRunningHttps() {
    return (global as any).httpsStarted ?? false;
  }
}

// Load the service immideately
DnsService.getInstance();

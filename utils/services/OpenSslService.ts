import { MongoClient } from 'mongodb';
import openssl from 'openssl-nodejs';

export class OpenSslService {
  private static instance: OpenSslService;
  private rand?: string;

  private constructor() {}

  public static getInstance(): OpenSslService {
    if (!global.openSslServiceInstance) global.openSslServiceInstance = new OpenSslService();
    return global.openSslServiceInstance;
  }

  public async getRand(): Promise<string> {
    if (this.rand) return this.rand;
    const client = await MongoClient.connect(`mongodb://${process.env.MONGODB_URI}`);
    const db = client.db();
    const settings = await db.collection('settings').findOne();
    if (settings && settings.nextAuthSecret) {
      this.rand = settings.nextAuthSecret;
      client.close();
      return settings.secret;
    } else {
      // eslint-disable-next-line no-unused-vars
      let resolver: (value: any) => void;
      // eslint-disable-next-line no-unused-vars
      let rejector: (reason?: any) => void;
      const returnPromise = new Promise<string>((resolve, reject) => {
        resolver = resolve;
        rejector = reject;
      });
      openssl('openssl rand -base64 32', async (err: Buffer, buffer: Buffer) => {
        const error = err.toString();
        if (error) {
          console.error(error);
          rejector(error);
        } else {
          this.rand = buffer.toString();
          // Save secret
          await db.collection('settings').updateOne({}, { $set: { nextAuthSecret: this.rand } }, { upsert: true });
          client.close();
          resolver(this.rand);
        }
      });
      return returnPromise;
    }
  }
}

// Load the service immediately
OpenSslService.getInstance();

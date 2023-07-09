import openssl from 'openssl-nodejs';
import { DatabaseService } from './DatabaseService';
import { SettingsService } from './SettingsService';

export class OpenSslService {
  private nextAuthSecret: string = '';

  private constructor() {
    this.getRand();
  }

  /**
   * Get the Singleton instance of this class
   * @returns The singleton instance
   */
  public static getInstance(): OpenSslService {
    if (!global.openSslServiceInstance) global.openSslServiceInstance = new OpenSslService();
    return global.openSslServiceInstance;
  }

  /**
   * Gets the randomly determined value for the NextAuth secret
   * @returns The randomly determined value for the NextAuth secret
   */
  public getNextAuthSecret() {
    return this.nextAuthSecret;
  }

  /**
   * Get the randomly determined value for the NextAuth secret.
   */
  private async getRand() {
    const savedNextAuthSecret = await SettingsService.getInstance().getNextAuthSecretAsync();
    console.log('savedNextAuthSecret', savedNextAuthSecret);
    if (savedNextAuthSecret) {
      this.nextAuthSecret = savedNextAuthSecret;
      return;
    }
    let resolver: () => void;
    // eslint-disable-next-line no-unused-vars
    let rejector: (arg0: any) => void;
    const returnPromise = (resolve: any, reject: any) => {
      resolver = resolve;
      rejector = reject;
    };
    openssl('openssl rand -base64 32', (async (err: any, buffer: any) => {
      const error = err.toString();
      if (error) rejector(error);
      else {
        const rand = buffer.toString();
        // Save secret
        DatabaseService.getInstance()
          .getClient()
          .collection('settings')
          .updateOne({}, { $set: { nextAuthSecret: rand } }, { upsert: true });
        resolver();
      }
    }) as any);
    return returnPromise;
  }
}

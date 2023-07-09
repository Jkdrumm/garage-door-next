import { Db, MongoClient } from 'mongodb';

/**
 * A service for interacting with the database.
 */
export class DatabaseService {
  private client: Db | undefined;
  // eslint-disable-next-line no-unused-vars
  private promiseList: ((value: Db) => void)[] = [];
  private constructor() {
    this.setup();
  }

  /**
   * Get the Singleton instance of this class
   * @returns The singleton instance
   */
  public static getInstance(): DatabaseService {
    if (!global.databseServiceInstance) global.databseServiceInstance = new DatabaseService();
    return global.databseServiceInstance;
  }

  private async setup() {
    this.client = (await MongoClient.connect(`mongodb://${process.env.MONGODB_URI}`)).db();
    this.promiseList.forEach(promise => promise(this.client as Db));
    this.promiseList = [];
  }

  /**
   * Gets the database client asynchronously.
   * @returns The database client
   */
  public async getClientAsync() {
    if (this.client) return this.client;
    const promise = new Promise<Db>(resolve => {
      this.promiseList.push(resolve);
    });
    return promise;
  }

  /**
   * Gets the database client synchronously.
   * @returns The database client
   * @throws If the database client is not initialized
   */
  public getClient() {
    if (!this.client) throw new Error('Database client not initialized');
    return this.client;
  }
}

import { MongoClient } from 'mongodb';
import { LogEntryResult, LogEvent, LogLength } from '../types/LogEntry';

export class LogService {
  private static instance: LogService;

  private constructor() {
    this.addEntry(LogEvent.BOOT, {});
  }

  public static getInstance(): LogService {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (process.env.NODE_ENV === 'development') {
      const global = globalThis as any;
      if (!global.logServiceInstance) global.logServiceInstance = new LogService();
      return global.logServiceInstance;
    }

    if (!this.instance) this.instance = new LogService();
    return this.instance;
  }

  public async getLogs(date: string, length: LogLength) {
    const startDate = new Date(date);
    startDate.setDate(startDate.getDate() + 1);
    const endDate = new Date(date);
    if (length === 'month') endDate.setMonth(endDate.getMonth() - 1);
    else if (length === 'week') endDate.setDate(endDate.getDate() - 6);
    const client = await MongoClient.connect(`${process.env.MONGODB_URI}`);
    const db = client.db();
    let resolver: (value: any) => void;
    let rejector: (reason?: any) => void;
    const returnPromise = new Promise<LogEntryResult[]>((resolve, reject) => {
      resolver = resolve;
      rejector = reject;
    });
    db.collection('logs')
      .find({ date: { $gte: endDate.toISOString(), $lt: startDate.toISOString() } })
      .toArray((error, result) => {
        client.close();
        if (error) rejector(error);
        else if (!result) rejector('No result');
        else {
          const formattedResult = result.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest })).reverse();
          resolver(formattedResult);
        }
      });
    return returnPromise;
  }

  public async addEntry(
    event: LogEvent,
    { oldValue, newValue, userId, username, firstName, lastName }: Omit<LogEntryResult, 'id' | 'event' | 'date'>
  ) {
    const client = await MongoClient.connect(`${process.env.MONGODB_URI}`);
    const db = client.db();
    await db
      .collection('logs')
      .insertOne({ event, date: new Date().toISOString(), oldValue, newValue, userId, username, firstName, lastName });
    client.close();
  }
}

// Load the service immediately
LogService.getInstance();

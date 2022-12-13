import { MongoClient } from 'mongodb';
import { LogEntryResult, LogEvent, LogLength } from '../types/LogEntry';

export class LogService {
  private constructor() {
    this.addEntry(LogEvent.BOOT, {});
  }

  /**
   * Get the Singleton instance of this class
   * @returns The singleton instance
   */
  public static getInstance(): LogService {
    if (!global.logServiceInstance) global.logServiceInstance = new LogService();
    return global.logServiceInstance;
  }

  /**
   * Gets all logs from the DB starting from a date through a specified time window.
   * @param date The date to start searching from
   * @param length The length of time to search back from the start date
   * @returns
   */
  public async getLogs(date: string, length: LogLength) {
    const startDate = new Date(date);
    startDate.setDate(startDate.getDate() + 1);
    const endDate = new Date(date);
    if (length === 'month') endDate.setMonth(endDate.getMonth() - 1);
    else if (length === 'week') endDate.setDate(endDate.getDate() - 6);
    const client = await MongoClient.connect(`mongodb://${process.env.MONGODB_URI}`);
    const db = client.db();
    // eslint-disable-next-line no-unused-vars
    let resolver: (value: any) => void;
    // eslint-disable-next-line no-unused-vars
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

  /**
   * Adds a log entry to the DB
   * @param event The type of event
   * @param settings Additional information to add to the log
   */
  public async addEntry(
    event: LogEvent,
    { oldValue, newValue, userId, username, firstName, lastName }: Omit<LogEntryResult, 'id' | 'event' | 'date'>
  ) {
    const client = await MongoClient.connect(`mongodb://${process.env.MONGODB_URI}`);
    const db = client.db();
    await db
      .collection('logs')
      .insertOne({ event, date: new Date().toISOString(), oldValue, newValue, userId, username, firstName, lastName });
    client.close();
  }
}

// Load the service immediately
LogService.getInstance();

import { MongoClient } from 'mongodb';
import { LogEntryResult, LogEvent, LogLength } from '../types/LogEntry';

export class LogService {
  private constructor() {
    this.addEntry(LogEvent.BOOT, {});
    const ogConsoleError = console.error;
    const ogConsoleWarn = console.warn;
    const ogConsoleLog = console.log;
    console.error = (message?: any, ...optionalParams: any[]) => {
      ogConsoleError(message, ...optionalParams);
      this.addEntry(LogEvent.ERROR, { data: this.getMessage(message, ...optionalParams) });
    };
    console.warn = (message?: any, ...optionalParams: any[]) => {
      ogConsoleWarn(message, ...optionalParams);
      this.addEntry(LogEvent.WARN, { data: this.getMessage(message, ...optionalParams) });
    };
    console.log = (message?: any, ...optionalParams: any[]) => {
      ogConsoleLog(message, ...optionalParams);
      this.addEntry(LogEvent.LOG, { data: this.getMessage(message, ...optionalParams) });
    };
    if (process.env.NODE_ENV === 'development') {
      console.warn = (message?: any, ...optionalParams: any[]) => {
        ogConsoleWarn(message, ...optionalParams);
        if (message === 'Warning: epoll is built for Linux and not intended for usage on Windows_NT.') return;
        this.addEntry(LogEvent.WARN, { data: this.getMessage(message, ...optionalParams) });
      };
      console.log = (message?: any, ...optionalParams: any[]) => {
        ogConsoleLog(message, ...optionalParams);
        // Don't save logs for build info in development
        if (optionalParams[0]?.toString().startsWith('compil')) return;
        this.addEntry(LogEvent.LOG, { data: this.getMessage(message, ...optionalParams) });
      };
    }
  }

  /**
   * Converts a console message into a format we can store in the DB
   * @param data The args of log/warn/error
   * @returns A formatted string
   */
  private getMessage(message?: any, ...optionalParams: any[]) {
    return JSON.stringify({
      message: message.toString().replace(
        // eslint-disable-next-line no-control-regex
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        ''
      ),
      optionalParams: optionalParams.map(element =>
        element.toString().replace(
          // eslint-disable-next-line no-control-regex
          /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
          ''
        )
      )
    });
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
    { oldValue, newValue, userId, username, firstName, lastName, data }: Omit<LogEntryResult, 'id' | 'event' | 'date'>
  ) {
    const client = await MongoClient.connect(`mongodb://${process.env.MONGODB_URI}`);
    const db = client.db();
    await db.collection('logs').insertOne({
      event,
      date: new Date().toISOString(),
      oldValue,
      newValue,
      userId,
      username,
      firstName,
      lastName,
      data
    });
    client.close();
  }
}

// Load the service immediately
LogService.getInstance();

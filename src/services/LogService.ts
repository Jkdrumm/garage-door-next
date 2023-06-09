import { MongoClient } from 'mongodb';
import { LogEntry, LogEntryResult, LogEvent, LogLength } from 'types';
import { WebSocketService } from 'services';
import { UserLevel } from 'enums';

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

    // Different logging for development.
    if (process.env.NODE_ENV === 'development') {
      console.warn = (message?: any, ...optionalParams: any[]) => {
        ogConsoleWarn(message, ...optionalParams);
        //Message must not include any of the strings in the array to be logged.
        if (
          [
            'Warning: epoll is built for Linux and not intended for usage on Windows_NT.',
            'https://nextjs.org/docs/messages/fast-refresh-reload',
            'Fast Refresh had to perform a full reload due to a runtime error.',
            'FAKE CERTIFICATES (for testing) only',
            '[staging] ACME Staging Directory URL: https://acme-staging-v02.api.letsencrypt.org/directory'
          ].some(
            element =>
              message?.toString().includes(element) ||
              optionalParams?.some(element => element?.toString().includes(element)) ||
              !message
          )
        )
          return;
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
    // eslint-disable-next-line no-control-regex
    const regex = /[\u001b\u009b][[()#;?]*(?:\d{1,4}(?:;\d{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
    return JSON.stringify({
      message: message?.toString ? message?.toString().replace(regex, '') : message,
      optionalParams: optionalParams.map(element => element?.toString().replace(regex, ''))
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
    return new Promise<LogEntry[]>((resolve, reject) => {
      db.collection('logs')
        .find({ date: { $gte: endDate.toISOString(), $lt: startDate.toISOString() } })
        .toArray((error, result) => {
          client.close().catch(console.error);
          if (error) reject(error);
          else if (!result) reject('No result');
          else {
            const formattedResult = result
              .map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest }))
              .reverse() as LogEntry[];
            resolve(formattedResult);
          }
        });
    });
  }

  /**
   * Adds a log entry to the DB
   * @param event The type of event
   * @param settings Additional information to add to the log
   */
  public addEntry(
    event: LogEvent,
    { oldValue, newValue, userId, username, firstName, lastName, data }: Omit<LogEntryResult, 'id' | 'event' | 'date'>
  ) {
    const log = {
      event,
      date: new Date().toISOString(),
      oldValue,
      newValue,
      userId,
      username,
      firstName,
      lastName,
      data
    };
    MongoClient.connect(`mongodb://${process.env.MONGODB_URI}`)
      .then(async client => {
        const db = client.db();
        const result = await db.collection('logs').insertOne(log);
        WebSocketService.getInstance().emitMessage('LIVE_LOG', UserLevel.ADMIN, {
          id: result.insertedId.toString(),
          ...log
        } as LogEntry);
        await client.close();
      })
      .catch(console.error);
  }
}

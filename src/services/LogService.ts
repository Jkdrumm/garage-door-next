import { LogEntry, LogEntryResult, LogLength } from 'types';
import { WebSocketService } from './WebSocketService';
import { LogEvent } from 'enums';
import { DatabaseService } from 'services';

export class LogService {
  private logCache: LogEntry[] | undefined = undefined;

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
            '[staging] ACME Staging Directory URL: https://acme-staging-v02.api.letsencrypt.org/directory',
          ].some(
            element =>
              message?.toString().includes(element) ||
              optionalParams?.some(element => element?.toString().includes(element)) ||
              !message,
          )
        )
          return;
        this.addEntry(LogEvent.WARN, { data: this.getMessage(message, ...optionalParams) });
      };
      console.log = (message?: any, ...optionalParams: any[]) => {
        ogConsoleLog(message, ...optionalParams);
        // Don't save logs for build info in development
        if (optionalParams[0]?.toString().startsWith('compil')) return;
        // Don't save logs for env info in development
        if (optionalParams[0]?.toString().includes('Loaded env from ')) return;
        this.addEntry(LogEvent.LOG, { data: this.getMessage(message, ...optionalParams) });
      };
    }

    const now = this.formatDate(new Date());
    // Load logs from the current day into the cache
    this.getLogs(now, 'day').then(logs => (this.logCache = logs));
    // Get the ms until the next day
    const msUntilNextDay = new Date(now).getTime() + 86400000 - Date.now();
    // Refresh the cache at the start of the next day
    setTimeout(() => {
      this.logCache = [];
      // Refresh the cache every day
      setInterval(() => {
        this.getLogs(this.formatDate(new Date()), 'day').then(logs => (this.logCache = logs));
      }, 86400000);
    }, msUntilNextDay);
  }

  /**
   * Converts a console message into a format we can store in the DB
   * @param data The args of log/warn/error
   * @returns A formatted string
   */
  private getMessage(message?: any, ...optionalParams: any[]) {
    // eslint-disable-next-line no-control-regex
    const regex = /\u009b[[()#;?]*(?:\d{1,4}(?:;\d{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
    return JSON.stringify({
      message: message?.toString ? message?.toString().replace(regex, '') : message,
      optionalParams: optionalParams.map(element => element?.toString().replace(regex, '')),
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
    // First format the date to be in the correct format
    date = this.formatDate(date);
    // If the date is today and we have a cache, return the cache
    if (date === this.formatDate(new Date()) && this.logCache && length === 'day') return this.logCache;
    const startDate = new Date(date);
    startDate.setDate(startDate.getDate() + 1);
    const endDate = new Date(date);
    if (length === 'month') endDate.setMonth(endDate.getMonth() - 1);
    else if (length === 'week') endDate.setDate(endDate.getDate() - 6);
    const client = await DatabaseService.getInstance().getClientAsync();
    const logs = await new Promise<LogEntry[]>((resolve, reject) => {
      client
        .collection('logs')
        .find({ date: { $gte: endDate.toISOString(), $lt: startDate.toISOString() } })
        .toArray((error, result) => {
          if (error) reject(error);
          else if (!result) reject('No result');
          else {
            const formattedResult = result
              .map(({ _id, ...rest }) => {
                const values = { id: _id.toString(), ...rest };
                return values;
              })
              .reverse() as LogEntry[];
            resolve(formattedResult);
          }
        });
    });
    return logs;
  }

  /**
   * Formats a date into a string that can be used in the DB (yyyy-mm-dd)
   * @param date The date to format
   * @returns The formatted date
   */
  public formatDate(date: Date | string) {
    if (typeof date === 'string') date = new Date(date);
    if (isNaN(date.getTime())) throw new Error('Invalid date');
    return date.toISOString().split('T')[0];
  }

  /**
   * Adds a log entry to the DB
   * @param event The type of event
   * @param settings Additional information to add to the log
   */
  public async addEntry(
    event: LogEvent,
    { oldValue, newValue, userId, username, firstName, lastName, data }: Omit<LogEntryResult, 'id' | 'event' | 'date'>,
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
      data,
    };
    const client = await DatabaseService.getInstance().getClientAsync();
    client
      .collection('logs')
      .insertOne(log)
      .then(result => {
        const newLog = {
          id: result.insertedId.toString(),
          ...log,
        } as LogEntry;
        delete (newLog as any)._id;
        this.logCache?.unshift(newLog);
        WebSocketService.getInstance().emitMessage('LIVE_LOG', newLog);
      });
  }
}

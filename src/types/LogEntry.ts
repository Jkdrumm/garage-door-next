/* eslint-disable no-unused-vars */
import { GarageState, LogEvent } from 'enums';

export type LogEntry = (
  | {
      event: LogEvent.PRESS;
      userId: string;
      username: string;
      firstName: string;
      lastName: string;
      date: string;
    }
  | {
      event: LogEvent.STATE_CHANGE;
      oldValue: GarageState;
      newValue: GarageState;
      date: string;
    }
  | { event: LogEvent.BOOT | LogEvent.SHUT_DOWN; date: string }
  | { event: LogEvent.DNS_UPDATE; date: string }
  | { event: LogEvent.ERROR | LogEvent.WARN | LogEvent.LOG; date: string; data: string }
) & { id: string };

export type LogEntryResult = {
  id: string;
  event: LogEvent;
  oldValue?: GarageState;
  newValue?: GarageState;
  userId?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  date: string;
  data?: string;
};

export type LogLength = 'day' | 'week' | 'month';

import { GarageEvent, UserLevel, GarageState } from 'enums';
import type { LogEntry } from './LogEntry';

export type Message =
  | { event: GarageEvent.ADMIN; message: UserLevel }
  | { event: GarageEvent.STATE; message: GarageState }
  | { event: GarageEvent.LOGS; message: LogEntry[] }
  | { event: GarageEvent.LIVE_LOG; message: LogEntry }
  | { event: GarageEvent.ACKNOWLEDGEMNET; message?: null }
  | { event: GarageEvent.SESSION_TIMEOUT; message?: null }
  | { event: GarageEvent.UNAUTHORIZED; message?: null };

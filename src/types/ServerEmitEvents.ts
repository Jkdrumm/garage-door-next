/* eslint-disable no-unused-vars */
import { GarageState, UserLevel } from 'enums';
import { User } from 'types';
import { LogEntry } from './LogEntry';
import { CheckForNewVersionData } from 'hooks';

export type ServerEmitEvents = {
  DNS_LOGIN: () => void;
  DNS_LOGIN_COMPLETE: (isLoggedIn: boolean) => void;
  GARAGE_STATE: (garageState: GarageState) => void;
  GETTING_CERTIFICATES: () => void;
  GETTING_CERTIFICATES_COMPLETE: (isRunningHttps: boolean) => void;
  LIVE_LOG: (log: LogEntry) => void;
  NEW_USER: (user: User) => void;
  SESSION_TIMEOUT: () => void;
  USER_LEVEL: ({
    userLevel,
    garageState,
    numNotifications,
  }: {
    userLevel: UserLevel;
    garageState?: GarageState;
    numNotifications?: number;
  }) => void;
  UPDATE_COMPLETE: () => void;
  UPDATE_FAILED: () => void;
  USER_DELETED: (id: string) => void;
  USER_UPDATED: (user: Partial<User>) => void;
  VERSION_CHECK: (version: CheckForNewVersionData) => void;
  VERSION_UPDATE: () => void;
};

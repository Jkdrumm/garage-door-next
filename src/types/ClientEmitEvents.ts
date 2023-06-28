/* eslint-disable no-unused-vars */
import type { DnsInfo, VersionData } from 'hooks';
import type { User } from './User';
import type { LogEntry } from './LogEntry';
import type { SocketReturnValue } from './SocketReturnValue';
import { GarageState, UserLevel } from 'enums';

export interface ClientEmitQueries {
  GET_DNS_INFO: (ack: (data: SocketReturnValue<DnsInfo>) => void) => void;
  GET_GARAGE_STATE: (ack: (data: SocketReturnValue<GarageState>) => void) => void;
  GET_LOGS: (ack: (data: SocketReturnValue<LogEntry[]>) => void) => void;
  GET_NUM_NOTIFICATIONS: (ack: (data: SocketReturnValue<number>) => void) => void;
  GET_USER: (ack: (data: SocketReturnValue<User>) => void) => void;
  GET_USER_LEVEL: (ack: (data: SocketReturnValue<UserLevel>) => void) => void;
  GET_USERS: (ack: (data: SocketReturnValue<User[]>) => void) => void;
  GET_VERSION: (ack: (data: SocketReturnValue<VersionData>) => void) => void;
}

export interface ClientEmitMutations {
  CHECK_FOR_NEW_VERSION: (ack: (data: SocketReturnValue<{ version: string; timeOfLastCheck: string }>) => void) => void;
  CONFIGURE_CERTIFICATES: (ack: (data: SocketReturnValue) => void) => void;
  CONFIGURE_DNS: (ack: (data: SocketReturnValue) => void) => void;
  DELETE_USER: (ack: (data: SocketReturnValue) => void) => void;
  INSTALL_UPDATE: (ack: (data: SocketReturnValue) => void) => void;
  PRESS: (payload?: undefined, ack?: () => void) => void;
  UPDATE_PROFILE: (ack: (data: SocketReturnValue) => void) => void;
  UPDATE_USER: (ack: (data: SocketReturnValue) => void) => void;
}

export type ClientEmitEvents = ClientEmitQueries & ClientEmitMutations;

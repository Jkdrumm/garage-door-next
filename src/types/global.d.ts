/* eslint-disable no-unused-vars */
import type {
  DatabaseService,
  DnsService,
  GarageDoorService,
  LogService,
  OpenSslService,
  SettingsService,
  UsersService,
  VersionService,
  WebSocketService,
} from 'services';

/**
 * This is where to declare global variables for TypeScript intellisense.
 */
declare global {
  var httpsStarted: boolean;
  var certificateRefreshTime: number;
  var databseServiceInstance: DatabaseService;
  var dnsServiceInstance: DnsService;
  var garageDoorServiceInstance: GarageDoorService;
  var logServiceInstance: LogService;
  var openSslServiceInstance: OpenSslService;
  var usersServiceInstance: UsersService;
  var settingsServiceInstance: SettingsService;
  var versionServiceInstance: VersionService;
  var webSocketManagerInstance: WebSocketService;
  var NEXTAUTH_SECRET: string;
  function startHttps(): void;
  function completeUpdate(): void;
}

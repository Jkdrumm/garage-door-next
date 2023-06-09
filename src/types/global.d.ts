/* eslint-disable no-unused-vars */
import type {
  DnsService,
  GarageDoorService,
  LogService,
  OpenSslService,
  UsersService,
  VersionService,
  WebSocketService
} from 'services';

/**
 * This is where to declare global variables for TypeScript intellisense.
 */
declare global {
  var httpsStarted: boolean;
  var certificateRefreshTime: number;
  var dnsServiceInstance: DnsService;
  var garageDoorServiceInstance: GarageDoorService;
  var logServiceInstance: LogService;
  var openSslServiceInstance: OpenSslService;
  var usersServiceInstance: UsersService;
  var versionServiceInstance: VersionService;
  var webSocketManagerInstance: WebSocketService;
  var NEXTAUTH_SECRET: string;
  function startHttps(): void;
  function completeUpdate(): void;
}

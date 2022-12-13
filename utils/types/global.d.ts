/* eslint-disable no-unused-vars */
import type {
  DnsService,
  GarageDoorService,
  LogService,
  OpenSslService,
  UsersService,
  WebSocketService
} from '../services';

/**
 * This is where to declare global variables for TypeScript intellisense.
 */
declare global {
  var httpsStarted: boolean;
  var startHttps: () => void;
  var dnsServiceInstance: DnsService;
  var garageDoorServiceInstance: GarageDoorService;
  var logServiceInstance: LogService;
  var openSslServiceInstance: OpenSslService;
  var usersServiceInstance: UsersService;
  var webSocketManagerInstance: WebSocketService;
  var NEXTAUTH_SECRET: string;
}

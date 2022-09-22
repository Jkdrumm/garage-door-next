/* eslint-disable no-unused-vars */
import type {
  DnsService,
  GarageDoorService,
  LogService,
  OpenSslService,
  UsersService,
  WebSocketService
} from '../services';

declare global {
  var startHttps: () => void;
  var dnsServiceInstance: DnsService;
  var garageDoorServiceInstance: GarageDoorService;
  var logServiceInstance: LogService;
  var openSslServiceInstance: OpenSslService;
  var usersServiceInstance: UsersService;
  var webSocketManagerInstance: WebSocketService;
}

/* eslint-disable no-unused-vars */
import type { DnsService, GarageDoorService, LogService, UsersService } from '../services';

declare global {
  var startHttps: () => void;
  var dnsServiceInstance: DnsService;
  var garageDoorServiceInstance: GarageDoorService;
  var logServiceInstance: LogService;
  var usersServiceInstance: UsersService;
}
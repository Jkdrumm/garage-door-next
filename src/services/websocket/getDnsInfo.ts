import { Socket } from 'socket.io';
import { addEventListener } from './utils';
import { DnsService } from 'services';

export function getDnsInfo(socket: Socket, id: string) {
  addEventListener(socket, id, 'GET_DNS_INFO', async () => {
    const dnsService = DnsService.getInstance();
    return {
      hostname: dnsService.getHostname(),
      isLoggedIn: dnsService.getIsLoggedIn(),
      isLoggingIn: dnsService.getIsLoggingIn(),
      isRunningHttps: dnsService.getIsRunningHttps(),
    };
  });
}

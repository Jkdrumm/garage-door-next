import { Socket } from 'socket.io';
import { addEventListener } from './utils';
import { DnsService } from 'services';

export async function getDnsInfo(socket: Socket, id: string) {
  addEventListener(socket, id, 'GET_DNS_INFO', async () => {
    const dnsService = DnsService.getInstance();
    const hostname = dnsService.getHostname();
    const isLoggedIn = dnsService.getIsLoggedIn();
    const isRunningHttps = dnsService.getIsRunningHttps();
    return { hostname, isLoggedIn, isRunningHttps };
  });
}

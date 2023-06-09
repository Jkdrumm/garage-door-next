import { Socket } from 'socket.io';
import { addEventListener } from './utils';
import { DnsService } from 'services';

export async function configureDNS(socket: Socket, id: string) {
  addEventListener(
    socket,
    id,
    'CONFIGURE_DNS',
    async ({ key, secret, hostname }: { key: string; secret: string; hostname: string }) => {
      await DnsService.getInstance().newLogin(key, secret, hostname);
    }
  );
}

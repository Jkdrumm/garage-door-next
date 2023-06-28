import { Socket } from 'socket.io';
import { addEventListener } from './utils';
import { DnsService } from 'services';

export function configureDNS(socket: Socket, id: string) {
  addEventListener(
    socket,
    id,
    'CONFIGURE_DNS',
    async ({ key, secret, hostname }: { key: string; secret: string; hostname: string }) =>
      await DnsService.getInstance().newLogin(key, secret, hostname),
    {
      failureDataFn: error => {
        if (error.statusCode === 404) return 'Invalid credentials. Please try again.';
        return error.message;
      },
    },
  );
}

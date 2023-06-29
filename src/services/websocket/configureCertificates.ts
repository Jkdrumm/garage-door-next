import { Socket } from 'socket.io';
import { addEventListener } from './utils';
import { DnsService } from 'services';

export function configureCertificates(socket: Socket, id: string) {
  addEventListener(socket, id, 'CONFIGURE_CERTIFICATES', () => DnsService.getInstance().getNewCertificates());
}

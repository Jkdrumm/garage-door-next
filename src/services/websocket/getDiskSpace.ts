import { Socket } from 'socket.io';
import { addEventListener } from './utils';
import { fsSize } from 'systeminformation';

export function getDiskSpace(socket: Socket, id: string) {
  addEventListener(socket, id, 'GET_DISK_SPACE', async () => {
    const disk = (await fsSize())[0];
    return {
      available: disk.available,
      size: disk.size,
    };
  });
}

import { Socket } from 'socket.io';
import { LogLength } from 'types';
import { LogService } from 'services';
import { addEventListener } from './utils';

export function getLogs(socket: Socket, id: string) {
  addEventListener(
    socket,
    id,
    'GET_LOGS',
    async ({ date, length }: { date: string; length: LogLength }) =>
      await LogService.getInstance().getLogs(date, length),
  );
}

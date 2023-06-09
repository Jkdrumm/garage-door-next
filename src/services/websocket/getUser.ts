import { Socket } from 'socket.io';
import { addEventListener } from './utils';
import { UsersService } from 'services';
import { UserLevel } from 'enums';

export function getUser(socket: Socket, id: string) {
  addEventListener(socket, id, 'GET_USER', async () => UsersService.getInstance().getUser(id), {
    userLevel: UserLevel.ACCOUNT
  });
}

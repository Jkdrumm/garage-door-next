import { Socket } from 'socket.io';
import { addEventListener } from './utils';
import { UsersService } from 'services';
import { UserLevel } from 'enums';

export async function getUserLevel(socket: Socket, id: string) {
  addEventListener(socket, id, 'GET_USER_LEVEL', () => UsersService.getInstance().getUserLevel(id), {
    userLevel: UserLevel.ACCOUNT
  });
}

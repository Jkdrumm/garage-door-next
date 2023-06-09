import { Socket } from 'socket.io';
import { addEventListener } from './utils';
import { UsersService } from 'services';

export async function getUsers(socket: Socket, id: string) {
  addEventListener(socket, id, 'GET_USERS', async () => UsersService.getInstance().getUsers());
}

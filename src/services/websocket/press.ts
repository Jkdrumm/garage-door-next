import { Socket } from 'socket.io';
import { addEventListener } from './utils';
import { UserLevel } from 'enums';
import { GarageDoorService } from 'services';

export async function press(socket: Socket, id: string) {
  addEventListener(socket, id, 'PRESS', () => GarageDoorService.getInstance().pressButton(id), {
    userLevel: UserLevel.USER
  });
}

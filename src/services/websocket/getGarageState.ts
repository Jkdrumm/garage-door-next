import { Socket } from 'socket.io';
import { addEventListener } from './utils';
import { GarageDoorService } from 'services';
import { UserLevel } from 'enums';

export function getGarageState(socket: Socket, id: string) {
  addEventListener(socket, id, 'GET_GARAGE_STATE', () => GarageDoorService.getInstance().getDoorState(), {
    userLevel: UserLevel.VIEWER,
  });
}

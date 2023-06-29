import { Socket } from 'socket.io';
import { addEventListener } from './utils';
import { UsersService } from 'services';
import { UserLevel } from 'enums';

export function getNumNotifications(socket: Socket, id: string) {
  addEventListener(
    socket,
    id,
    'GET_NUM_NOTIFICATIONS',
    async () => {
      const userLevel = UsersService.getInstance().getUserLevel(id);
      return UsersService.getInstance().getNotificationCount(userLevel);
    },
    {
      userLevel: UserLevel.ACCOUNT,
    },
  );
}

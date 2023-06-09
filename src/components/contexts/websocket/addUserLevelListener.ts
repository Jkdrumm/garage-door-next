import { QueryClient } from '@tanstack/react-query';
import { Socket } from 'socket.io-client';
import { UserLevel, GarageState } from 'enums';
import { GARAGE_STATE_QUERY_KEY, NOTIFICATION_QUERY_KEY, USER_LEVEL_QUERY_KEY } from 'hooks';

export function addUserLevelListener(socket: Socket, queryClient: QueryClient) {
  socket.on(
    'USER_LEVEL',
    ({
      userLevel,
      garageState,
      numNotifications
    }: {
      userLevel: UserLevel;
      garageState?: GarageState;
      numNotifications?: number;
    }) => {
      queryClient.setQueryData(USER_LEVEL_QUERY_KEY, userLevel);
      if (garageState) queryClient.setQueryData(GARAGE_STATE_QUERY_KEY, garageState);
      if (numNotifications) queryClient.setQueryData(NOTIFICATION_QUERY_KEY, numNotifications);
    }
  );
}

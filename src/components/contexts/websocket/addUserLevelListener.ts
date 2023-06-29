import { QueryClient } from '@tanstack/react-query';
import { GARAGE_STATE_QUERY_KEY, NOTIFICATION_QUERY_KEY, USER_LEVEL_QUERY_KEY } from 'hooks';
import { ClientSocket } from 'types';

export function addUserLevelListener(socket: ClientSocket, queryClient: QueryClient) {
  socket.on('USER_LEVEL', ({ userLevel, garageState, numNotifications }) => {
    queryClient.setQueryData([USER_LEVEL_QUERY_KEY], userLevel);
    if (garageState) queryClient.setQueryData([GARAGE_STATE_QUERY_KEY], garageState);
    if (numNotifications) queryClient.setQueryData([NOTIFICATION_QUERY_KEY], numNotifications);
  });
}

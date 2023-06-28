import { QueryClient } from '@tanstack/react-query';
import { GARAGE_STATE_QUERY_KEY } from 'hooks';
import { ClientSocket } from 'types';

export function addGarageStateListener(socket: ClientSocket, queryClient: QueryClient) {
  socket.on('GARAGE_STATE', garageState => {
    queryClient.setQueryData([GARAGE_STATE_QUERY_KEY], garageState);
  });
}

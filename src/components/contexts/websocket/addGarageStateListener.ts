import { QueryClient } from '@tanstack/react-query';
import { Socket } from 'socket.io-client';
import { GarageState } from 'enums';
import { GARAGE_STATE_QUERY_KEY } from 'hooks';

export function addGarageStateListener(socket: Socket, queryClient: QueryClient) {
  socket.on('GARAGE_STATE', (garageState: GarageState) => {
    queryClient.setQueryData(GARAGE_STATE_QUERY_KEY, garageState);
  });
}

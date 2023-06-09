import { QueryClient } from '@tanstack/react-query';
import { Socket } from 'socket.io-client';
import { UPDATE_COMPLETE_QUERY_KEY } from 'hooks';

export function addUpdateCompleteListener(socket: Socket, queryClient: QueryClient) {
  socket.on('UPDATE_COMPLETE', () => queryClient.setQueryData(UPDATE_COMPLETE_QUERY_KEY, true));
}

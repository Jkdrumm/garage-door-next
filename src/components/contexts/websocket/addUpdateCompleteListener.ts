import { QueryClient } from '@tanstack/react-query';
import { UPDATE_COMPLETE_QUERY_KEY } from 'hooks';
import { ClientSocket } from 'types';

export function addUpdateCompleteListener(socket: ClientSocket, queryClient: QueryClient) {
  socket.on('UPDATE_COMPLETE', () => queryClient.setQueryData([UPDATE_COMPLETE_QUERY_KEY], true));
}

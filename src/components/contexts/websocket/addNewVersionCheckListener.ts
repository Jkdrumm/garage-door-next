import { QueryClient } from '@tanstack/react-query';
import { CheckForNewVersionData, VERSION_QUERY_KEY } from 'hooks';
import { ClientSocket } from 'types';

export function addNewVersionCheckListener(socket: ClientSocket, queryClient: QueryClient) {
  socket.on('VERSION_CHECK', (version: CheckForNewVersionData) => {
    queryClient.setQueryData<CheckForNewVersionData>([VERSION_QUERY_KEY], prev =>
      prev ? { ...prev, ...version } : undefined,
    );
  });
}

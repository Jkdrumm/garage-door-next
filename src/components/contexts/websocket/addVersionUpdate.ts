import { QueryClient } from '@tanstack/react-query';
import { VERSION_QUERY_KEY, VersionData } from 'hooks';
import { ClientSocket } from 'types';

export function addVersionUpdate(socket: ClientSocket, queryClient: QueryClient) {
  socket.on('VERSION_UPDATE', () => {
    queryClient.setQueryData<VersionData>([VERSION_QUERY_KEY], prev =>
      prev
        ? {
            ...prev,
            isCurrentlyUpdating: true,
          }
        : undefined,
    );
  });
}

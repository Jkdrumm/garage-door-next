import { QueryClient } from '@tanstack/react-query';
import { UPDATE_COMPLETE_QUERY_KEY, VERSION_QUERY_KEY, VersionData } from 'hooks';
import { ClientSocket } from 'types';

export function addUpdateFailedListener(socket: ClientSocket, queryClient: QueryClient) {
  socket.on('UPDATE_FAILED', () => {
    queryClient.setQueryData([UPDATE_COMPLETE_QUERY_KEY], false);
    queryClient.setQueryData<VersionData>([VERSION_QUERY_KEY], prevData =>
      prevData ? { ...prevData, isCurrentlyUpdating: false } : undefined,
    );
  });
}

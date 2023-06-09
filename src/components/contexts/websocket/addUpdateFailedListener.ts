import { QueryClient } from '@tanstack/react-query';
import { Socket } from 'socket.io-client';
import { UPDATE_COMPLETE_QUERY_KEY, VERSION_QUERY_KEY, VersionData } from 'hooks';

export function addUpdateFailedListener(socket: Socket, queryClient: QueryClient) {
  socket.on('UPDATE_FAILED', () => {
    queryClient.setQueryData(UPDATE_COMPLETE_QUERY_KEY, false);
    queryClient.setQueryData<VersionData>(VERSION_QUERY_KEY, prevData =>
      prevData ? { ...prevData, isCurrentlyUpdating: false } : undefined
    );
  });
}

import { QueryClient } from '@tanstack/react-query';
import { LOGS_QUERY_KEY } from 'hooks';
import { ClientSocket, LogEntry } from 'types';

export function addLiveLogListener(socket: ClientSocket, queryClient: QueryClient) {
  socket.on('LIVE_LOG', log => {
    ['day', 'week', 'month'].forEach(length => {
      queryClient.setQueryData<LogEntry[]>(
        [LOGS_QUERY_KEY, { date: new Date().toLocaleDateString(), length }],
        prevData => (prevData ? [log, ...prevData] : undefined),
      );
    });
  });
}

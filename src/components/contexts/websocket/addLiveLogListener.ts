import { QueryClient } from '@tanstack/react-query';
import { LOGS_QUERY_KEY } from 'hooks';
import { LogEntry } from 'types';
import { Socket } from 'socket.io-client';

export function addLiveLogListener(socket: Socket, queryClient: QueryClient) {
  socket.on('LIVE_LOG', (log: LogEntry) => {
    ['day', 'week', 'month'].forEach(length => {
      queryClient.setQueryData<LogEntry[]>([LOGS_QUERY_KEY, new Date().toLocaleDateString(), length], prevData =>
        prevData ? [log, ...prevData] : undefined
      );
    });
  });
}

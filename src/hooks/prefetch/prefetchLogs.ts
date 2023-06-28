import { QueryClient } from '@tanstack/react-query';
import { LOGS_QUERY_KEY } from 'hooks';
import { LogService } from 'services';
import { LogEntry } from 'types';

/**
 * Preloads users data during prefetching.
 * @param queryClient {@link QueryClient}
 */
export async function prefetchLogs(queryClient: QueryClient) {
  const date = new Date().toLocaleDateString();
  // Get all logs from the current day and convert all undefined values to null since undefined is not valid JSON.
  const logs = (await LogService.getInstance().getLogs(date, 'day')).map(log => {
    Object.keys(log).forEach(key => {
      if (log[key as keyof LogEntry] === undefined) log[key as keyof LogEntry] = null as any;
    });
    return log;
  });
  queryClient.setQueryData([LOGS_QUERY_KEY, { date, length: 'day' }], logs);
}

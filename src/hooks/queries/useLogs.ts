import { useContext, useRef } from 'react';
import { QueryFunctionContext, useQuery, UseQueryResult } from '@tanstack/react-query';
import type { LogEntry, LogLength, QueryOptions } from 'types';
import { WebSocketContext, WebSocketContextValue } from 'components';

export const LOGS_QUERY_KEY = 'logs';
const API_ROUTE = 'GET_LOGS';

async function FETCH_FUNC(
  { queryKey }: QueryFunctionContext,
  sendMessage: WebSocketContextValue['sendMessage']
): Promise<LogEntry[]> {
  return new Promise(resolve =>
    sendMessage(API_ROUTE, { date: queryKey[1], length: queryKey[2] }, ({ data }) => {
      resolve(data);
    })
  );
}
/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook to get the system logs.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export const useLogs = (date: Date, length: LogLength, options?: QueryOptions): UseQueryResult<LogEntry[]> => {
  const { sendMessage } = useContext(WebSocketContext);
  const currentSearchDate = useRef<string>();

  const dateFormatted = date.toLocaleDateString();
  currentSearchDate.current = dateFormatted;
  return useQuery<LogEntry[]>(
    [LOGS_QUERY_KEY, dateFormatted, length],
    queryContext => FETCH_FUNC(queryContext, sendMessage),
    options
  );
};

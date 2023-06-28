import { useRef } from 'react';
import type { LogEntry, LogLength } from 'types';
import { useQuery, UseQueryOptions } from './useQuery';

export const LOGS_QUERY_KEY = 'GET_LOGS';

type LogQueryParams = { date: string; length: LogLength };

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook to get the system logs.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export const useLogs = (date: Date, length: LogLength, options?: UseQueryOptions<LogEntry[], LogQueryParams>) => {
  const currentSearchDate = useRef<string>();

  const dateFormatted = date.toLocaleDateString();
  currentSearchDate.current = dateFormatted;
  return useQuery<LogEntry[], LogQueryParams>([LOGS_QUERY_KEY, { date: dateFormatted, length }], options);
};

import axios from 'axios';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { QueryOptions } from '../types';
import type { LogEntryResult, LogLength } from '../types/LogEntry';

export const LOGS_QUERY_KEY = ['logs'];
const API_ROUTE = '/api/logs';

const FETCH_FUNC = async ({ queryKey }: any) =>
  axios.post(API_ROUTE, { date: queryKey[1], length: queryKey[2] }).then(({ data }) => data);

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook to get the system logs.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export const useLogs = (date: Date, length: LogLength, options?: QueryOptions): UseQueryResult<LogEntryResult[]> => {
  const dateFormatted = date.toLocaleDateString();
  return useQuery<LogEntryResult[]>([LOGS_QUERY_KEY, dateFormatted, length], FETCH_FUNC, options);
};

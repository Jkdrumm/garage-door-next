import { useQuery, UseQueryOptions } from './useQuery';

export const CPU_TEMP_QUERY_KEY = 'GET_CPU_TEMP';

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook to get the CPU temperature.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export function useCpuTemp(options?: UseQueryOptions<number>) {
  return useQuery<number>([CPU_TEMP_QUERY_KEY], options);
}

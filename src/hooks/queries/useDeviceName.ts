import { useQuery, UseQueryOptions } from './useQuery';

export const DEVICE_NAME_QUERY_KEY = 'GET_DEVICE_NAME';

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook to get the device name.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export function useDeviceName(options?: UseQueryOptions<string>) {
  return useQuery<string>([DEVICE_NAME_QUERY_KEY], options);
}

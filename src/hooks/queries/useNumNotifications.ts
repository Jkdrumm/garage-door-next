import { useQuery, UseQueryOptions } from './useQuery';

export const NOTIFICATION_QUERY_KEY = 'GET_NUM_NOTIFICATIONS';

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook to get the notification count for a user.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export function useNumNotifications(options?: UseQueryOptions<number>) {
  return useQuery<number>([NOTIFICATION_QUERY_KEY], options);
}

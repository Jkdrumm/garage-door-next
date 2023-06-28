import type { User } from 'types';
import { useQuery, UseQueryOptions } from './useQuery';

export const USER_QUERY_KEY = 'GET_USER';

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook to get the user object.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export function useUser(options?: UseQueryOptions<User>) {
  return useQuery<User>([USER_QUERY_KEY], options);
}

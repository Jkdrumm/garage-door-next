import { useQuery, UseQueryOptions } from './useQuery';
import type { User } from 'types';

export const USERS_QUERY_KEY = 'GET_USERS';

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook to get all users.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export function useUsers(options?: UseQueryOptions<User[]>) {
  return useQuery<User[]>([USERS_QUERY_KEY], options);
}

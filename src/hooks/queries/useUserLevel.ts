import { useQuery, UseQueryOptions } from './useQuery';
import { UserLevel } from 'enums';

export const USER_LEVEL_QUERY_KEY = 'GET_USER_LEVEL';

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook to get the UserLevel of a user.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export function useUserLevel(options?: UseQueryOptions<UserLevel>) {
  return useQuery<UserLevel>([USER_LEVEL_QUERY_KEY], options);
}

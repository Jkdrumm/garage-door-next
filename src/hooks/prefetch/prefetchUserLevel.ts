import { QueryClient } from '@tanstack/react-query';
import { UserLevel } from 'enums';
import { USER_LEVEL_QUERY_KEY } from 'hooks/queries';

/**
 * Sets the user level during prefetching.
 * @param queryClient {@link QueryClient}
 * @param userLevel The {@link UserLevel}
 */
export function prefetchUserLevel(queryClient: QueryClient, userLevel: UserLevel) {
  queryClient.setQueryData(USER_LEVEL_QUERY_KEY, userLevel);
}

import type { User } from '../../types';
import { QueryClient } from '@tanstack/react-query';
import { USER_QUERY_KEY } from '../useUser';

/**
 * Sets the user data during prefetching.
 * @param queryClient {@link QueryClient}
 * @param user The {@link User}
 */
export function prefetchUser(queryClient: QueryClient, user: User) {
  const { id, firstName, lastName, username } = user;
  const prefetchedUser = { id, firstName, lastName, username };
  queryClient.setQueryData(USER_QUERY_KEY, prefetchedUser);
}

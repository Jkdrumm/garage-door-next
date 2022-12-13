import { QueryClient } from '@tanstack/react-query';
import { getUsers } from '../../auth/get';
import { USERS_QUERY_KEY } from '../useUsers';

/**
 * Preloads users data during prefetching.
 * @param queryClient {@link QueryClient}
 */
export function prefetchUsers(queryClient: QueryClient) {
  const users = getUsers();
  queryClient.setQueryData(USERS_QUERY_KEY, users);
}

import { QueryClient } from 'react-query';
import { getUsers } from '../../auth/get';
import { USERS_QUERY_KEY } from '../useUsers';

export const prefetchUsers = (queryClient: QueryClient) => {
  const users = getUsers();
  queryClient.setQueryData(USERS_QUERY_KEY, users);
};

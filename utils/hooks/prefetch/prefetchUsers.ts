import { QueryClient } from 'react-query';
import { getUsers } from '../../auth/get';
import { USERS_QUERY_KEY } from '../useUsers';

export const prefetchUsers = async (queryClient: QueryClient) => {
  const users = await getUsers();
  await queryClient.prefetchQuery(USERS_QUERY_KEY, () => users);
};

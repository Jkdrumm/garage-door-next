import type { User } from '../../types';
import { QueryClient } from 'react-query';
import { USER_QUERY_KEY } from '../useUser';

export const prefetchUser = async (queryClient: QueryClient, user: User) => {
  const { id, firstName, lastName, username } = user;
  const prefetchedUser = { id, firstName, lastName, username };
  await queryClient.prefetchQuery(USER_QUERY_KEY, () => prefetchedUser);
};

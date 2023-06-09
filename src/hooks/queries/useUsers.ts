import { useContext } from 'react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { QueryOptions, User } from 'types';
import { WebSocketContext, WebSocketContextValue } from 'components';

export const USERS_QUERY_KEY = ['users'];
const API_ROUTE = 'GET_USERS';

async function FETCH_FUNC(sendMessage: WebSocketContextValue['sendMessage']): Promise<User[]> {
  return new Promise(resolve =>
    sendMessage(API_ROUTE, undefined, ({ data }) => {
      resolve(data);
    })
  );
}
/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook to get all users.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export const useUsers = (options?: QueryOptions): UseQueryResult<User[]> => {
  const { sendMessage } = useContext(WebSocketContext);
  return useQuery<User[]>(USERS_QUERY_KEY, () => FETCH_FUNC(sendMessage), options);
};

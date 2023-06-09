import { useContext } from 'react';
import { WebSocketContext, WebSocketContextValue } from 'components';
import type { QueryOptions, User } from 'types';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

export const USER_QUERY_KEY = ['user'];
const API_ROUTE = 'GET_USER';

async function FETCH_FUNC(sendMessage: WebSocketContextValue['sendMessage']): Promise<User> {
  return new Promise(resolve =>
    sendMessage(API_ROUTE, undefined, ({ data }) => {
      resolve(data);
    })
  );
}

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook to get the user object.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export const useUser = (options?: QueryOptions): UseQueryResult<User> => {
  const { sendMessage } = useContext(WebSocketContext);
  return useQuery<User>(USER_QUERY_KEY, () => FETCH_FUNC(sendMessage), options);
};

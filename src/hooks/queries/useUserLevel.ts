import { useContext } from 'react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { UserLevel } from 'enums';
import { QueryOptions } from 'types';
import { WebSocketContext, WebSocketContextValue } from 'components';

export const USER_LEVEL_QUERY_KEY = ['userLevel'];
const API_ROUTE = 'GET_USER_LEVEL';

async function FETCH_FUNC(sendMessage: WebSocketContextValue['sendMessage']): Promise<UserLevel> {
  return new Promise(resolve =>
    sendMessage<UserLevel>(API_ROUTE, undefined, ({ data }) => {
      resolve(data);
    })
  );
}

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook to get the UserLevel of a user.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export const useUserLevel = (options?: QueryOptions): UseQueryResult<UserLevel> => {
  const { sendMessage } = useContext(WebSocketContext);
  return useQuery<UserLevel>(USER_LEVEL_QUERY_KEY, () => FETCH_FUNC(sendMessage), options);
};

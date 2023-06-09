import { useContext } from 'react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { QueryOptions } from 'types';
import { WebSocketContext, WebSocketContextValue } from 'components';

export const NOTIFICATION_QUERY_KEY = ['notifications'];
const API_ROUTE = 'GET_NUM_NOTIFICATIONS';

async function FETCH_FUNC(sendMessage: WebSocketContextValue['sendMessage']): Promise<number> {
  return new Promise(resolve =>
    sendMessage(API_ROUTE, undefined, ({ data }) => {
      resolve(data);
    })
  );
}

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook to get the notification count for a user.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export const useNumNotifications = (options?: QueryOptions): UseQueryResult<number> => {
  const { sendMessage } = useContext(WebSocketContext);
  return useQuery<number>(NOTIFICATION_QUERY_KEY, () => FETCH_FUNC(sendMessage), options);
};

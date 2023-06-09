import { useContext } from 'react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { GarageState } from 'enums';
import { QueryOptions } from 'types';
import { WebSocketContext, WebSocketContextValue } from 'components';

export const GARAGE_STATE_QUERY_KEY = ['garageState'];
const API_ROUTE = 'GET_GARAGE_STATE';

async function FETCH_FUNC(sendMessage: WebSocketContextValue['sendMessage']): Promise<GarageState> {
  return new Promise(resolve =>
    sendMessage(API_ROUTE, undefined, ({ data }) => {
      resolve(data);
    })
  );
}

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook to get the state of the garage.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export const useGarageState = (options?: QueryOptions): UseQueryResult<GarageState> => {
  const { sendMessage } = useContext(WebSocketContext);
  return useQuery<GarageState>(GARAGE_STATE_QUERY_KEY, () => FETCH_FUNC(sendMessage), {
    initialData: GarageState.FETCHING,
    staleTime: Infinity,
    ...options
  });
};

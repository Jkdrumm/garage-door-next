import { useContext } from 'react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { QueryOptions } from 'types';
import { WebSocketContextValue, WebSocketContext } from 'components';

export const VERSION_QUERY_KEY = ['version'];
const API_ROUTE = 'GET_VERSION';

async function FETCH_FUNC(sendMessage: WebSocketContextValue['sendMessage']): Promise<VersionData> {
  return new Promise(resolve =>
    sendMessage(API_ROUTE, undefined, ({ data: { version, timeOfLastCheck, isCurrentlyUpdating } }) => {
      resolve({
        version,
        timeOfLastCheck: new Date(timeOfLastCheck).toLocaleString(),
        isCurrentlyUpdating
      });
    })
  );
}

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook to get the version of the newest update.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export const useVersion = (options?: QueryOptions): UseQueryResult<VersionData> => {
  const { sendMessage } = useContext(WebSocketContext);
  return useQuery<VersionData>(VERSION_QUERY_KEY, () => FETCH_FUNC(sendMessage), options);
};

export type VersionData = {
  version: string;
  timeOfLastCheck: string;
  isCurrentlyUpdating: boolean;
};

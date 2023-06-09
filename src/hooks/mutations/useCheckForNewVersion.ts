import { useContext } from 'react';
import { useMutation, UseMutationOptions, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { WebSocketContext, WebSocketContextValue } from 'components';
import { VERSION_QUERY_KEY, VersionData } from 'hooks/queries';

export const CHECK_FOR_NEW_VERSION_QUERY_KEY = ['checkForNewVersion'];
const API_ROUTE = 'CHECK_FOR_NEW_VERSION';

async function FETCH_FUNC(sendMessage: WebSocketContextValue['sendMessage']): Promise<VersionData> {
  return new Promise(resolve =>
    sendMessage(API_ROUTE, undefined, ({ data: { version, timeOfLastCheck } }) => {
      resolve({
        version,
        timeOfLastCheck: new Date(timeOfLastCheck).toLocaleString()
      });
    })
  );
}

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook to check for a new version update.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export const useCheckForNewVersion = (
  options?: UseMutationOptions
): Omit<UseMutationResult<VersionData, unknown, void, unknown>, 'mutationKey' | 'mutationFn'> => {
  const { sendMessage } = useContext(WebSocketContext);
  const queryClient = useQueryClient();
  return useMutation<VersionData, unknown, void, unknown>(
    [CHECK_FOR_NEW_VERSION_QUERY_KEY],
    () => FETCH_FUNC(sendMessage),
    {
      ...options,
      onSuccess: (data, variables, context) => {
        queryClient.setQueryData(VERSION_QUERY_KEY, { version: data.version, timeOfLastCheck: data.timeOfLastCheck });
        options?.onSuccess?.(data, variables, context);
      }
    }
  );
};

import { useContext } from 'react';
import { useMutation, UseMutationOptions, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { WebSocketContext, WebSocketContextValue } from 'components';
import { VERSION_QUERY_KEY, VersionData } from 'hooks';

export const INSTALL_UPDATE_QUERY_KEY = ['installUpdate'];
const API_ROUTE = 'INSTALL_UPDATE';

async function FETCH_FUNC(sendMessage: WebSocketContextValue['sendMessage']): Promise<void> {
  return new Promise(resolve =>
    sendMessage(API_ROUTE, undefined, () => {
      resolve();
    })
  );
}
/**
 * A React Query {@link https://tanstack.com/query/v4/docs/react/reference/useMutation useMutation} hook to press the garage door button.
 * @param options The React Query Options
 * @returns A useMutation hook
 */
export const useInstallUpdate = (
  options?: UseMutationOptions
): Omit<UseMutationResult<void, unknown, void, unknown>, 'mutationKey' | 'mutationFn'> => {
  const { sendMessage } = useContext(WebSocketContext);
  const queryClient = useQueryClient();
  return useMutation<void, unknown, void, unknown>([INSTALL_UPDATE_QUERY_KEY], () => FETCH_FUNC(sendMessage), {
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData<VersionData>(VERSION_QUERY_KEY, prevData => {
        if (!prevData) return undefined;
        return { ...prevData, isCurrentlyUpdating: true };
      });
      options?.onSuccess?.(data, variables, context);
    }
  });
};

import { useContext } from 'react';
import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { WebSocketContext, WebSocketContextValue } from 'components';

export const PRESS_QUERY_KEY = ['press'];
const API_ROUTE = 'PRESS';

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
export const usePress = (
  options?: UseMutationOptions
): Omit<UseMutationResult<void, unknown, void, unknown>, 'mutationKey' | 'mutationFn'> => {
  const { sendMessage } = useContext(WebSocketContext);
  return useMutation<void, unknown, void, unknown>([PRESS_QUERY_KEY], () => FETCH_FUNC(sendMessage), options);
};

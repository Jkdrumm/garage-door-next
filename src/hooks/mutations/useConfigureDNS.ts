import { useContext } from 'react';
import { useMutation, UseMutationOptions, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { WebSocketContextValue, WebSocketContext } from 'components';
import { DNS_INFO_QUERY_KEY, DnsInfo } from 'hooks/queries';

export const CONFIGURE_DNS_QUERY_KEY = ['configureDNS'];
const API_ROUTE = 'CONFIGURE_DNS';

type ConfigureDnsParamaters = { key: string; secret: string; hostname: string };

async function FETCH_FUNC(
  sendMessage: WebSocketContextValue['sendMessage'],
  args: ConfigureDnsParamaters
): Promise<void> {
  return new Promise((resolve, reject) =>
    sendMessage(API_ROUTE, args, ({ error }) => {
      if (error) reject(error);
      else resolve();
    })
  );
}

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/react/reference/useMutation useMutation} hook to configure DNS settings.
 * @param options The React Query Options
 * @returns A useMutation hook
 */
export const useConfigureDns = (
  options?: UseMutationOptions<void, { error: string }, ConfigureDnsParamaters, unknown>
): Omit<UseMutationResult<void, unknown, ConfigureDnsParamaters, unknown>, 'mutationKey' | 'mutationFn'> => {
  const { sendMessage } = useContext(WebSocketContext);
  const queryClient = useQueryClient();
  return useMutation<void, { error: string }, ConfigureDnsParamaters, unknown>(
    CONFIGURE_DNS_QUERY_KEY,
    args => FETCH_FUNC(sendMessage, args),
    {
      ...options,
      onSuccess: (data, variables, context) => {
        queryClient.setQueryData<DnsInfo>(DNS_INFO_QUERY_KEY, queryData => {
          if (!queryData) return undefined;
          return { ...queryData, isLoggedIn: true };
        });
        options?.onSuccess?.(data, variables, context);
      }
    }
  );
};

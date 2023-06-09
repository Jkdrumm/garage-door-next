import { useContext } from 'react';
import { useMutation, UseMutationOptions, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { WebSocketContextValue, WebSocketContext } from 'components';
import { DNS_INFO_QUERY_KEY, DnsInfo } from 'hooks/queries';

export const CONFIGURE_CERTIFICATES_QUERY_KEY = ['configureCertificates'];
const API_ROUTE = 'CONFIGURE_CERTIFICATES';

async function FETCH_FUNC(sendMessage: WebSocketContextValue['sendMessage']): Promise<void> {
  return new Promise((resolve, reject) =>
    sendMessage(API_ROUTE, undefined, ({ error }) => {
      if (error) reject(error);
      else resolve();
    })
  );
}

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/react/reference/useMutation useMutation} hook configure HTTPS certificates.
 * @param options The React Query Options
 * @returns A useMutation hook
 */
export const useConfigureCertificates = (
  options?: UseMutationOptions<void, unknown, void, unknown>
): Omit<UseMutationResult<void, unknown, void, unknown>, 'mutationKey' | 'mutationFn'> => {
  const { sendMessage } = useContext(WebSocketContext);
  const queryClient = useQueryClient();
  return useMutation<void, unknown, void, unknown>(CONFIGURE_CERTIFICATES_QUERY_KEY, () => FETCH_FUNC(sendMessage), {
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData<DnsInfo>(DNS_INFO_QUERY_KEY, queryData => {
        if (!queryData) return undefined;
        return { ...queryData, isRunningHttps: true };
      });
      options?.onSuccess?.(data, variables, context);
    }
  });
};

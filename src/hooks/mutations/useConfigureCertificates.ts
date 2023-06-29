import { useQueryClient } from '@tanstack/react-query';
import { DNS_INFO_QUERY_KEY, DnsInfo } from 'hooks/queries';
import { useMutation, UseMutationOptions } from './useMutation';

export const CONFIGURE_CERTIFICATES_QUERY_KEY = 'CONFIGURE_CERTIFICATES';

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/react/reference/useMutation useMutation} hook configure HTTPS certificates.
 * @param options The React Query Options
 * @returns A useMutation hook
 */
export function useConfigureCertificates(options?: UseMutationOptions) {
  const queryClient = useQueryClient();
  return useMutation([CONFIGURE_CERTIFICATES_QUERY_KEY], {
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData<DnsInfo>([DNS_INFO_QUERY_KEY], queryData => {
        if (!queryData) return undefined;
        return { ...queryData, isRunningHttps: true };
      });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

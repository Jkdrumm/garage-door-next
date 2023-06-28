import { useQueryClient } from '@tanstack/react-query';
import { DNS_INFO_QUERY_KEY, DnsInfo } from 'hooks/queries';
import { useMutation, UseMutationOptions } from './useMutation';

export const CONFIGURE_DNS_QUERY_KEY = 'CONFIGURE_DNS';

type ConfigureDnsParamaters = { key: string; secret: string; hostname: string };

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/react/reference/useMutation useMutation} hook to configure DNS settings.
 * @param options The React Query Options
 * @returns A useMutation hook
 */
export function useConfigureDns(options?: UseMutationOptions<void, ConfigureDnsParamaters>) {
  const queryClient = useQueryClient();
  return useMutation<void, ConfigureDnsParamaters>([CONFIGURE_DNS_QUERY_KEY], {
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData<DnsInfo>([DNS_INFO_QUERY_KEY], queryData => {
        if (!queryData) return undefined;
        return { ...queryData, isLoggedIn: true };
      });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

import { useQuery, UseQueryOptions } from './useQuery';

export const DNS_INFO_QUERY_KEY = 'GET_DNS_INFO';

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook to get the system DNS info.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export function useDnsInfo(options?: UseQueryOptions<DnsInfo>) {
  return useQuery<DnsInfo>([DNS_INFO_QUERY_KEY], options);
}

export interface DnsInfo {
  hostname: string | null;
  isLoggedIn: boolean;
  isLoggingIn: boolean;
  isRunningHttps: boolean;
  isGettingCertificates: boolean;
}

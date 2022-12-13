import { QueryClient } from '@tanstack/react-query';
import { DnsInfo, DNS_INFO_QUERY_KEY } from '../useDnsInfo';

/**
 * Sets the DNS information during prefetching.
 * @param queryClient {@link QueryClient}
 * @param dnsInfo The {@link DnsInfo}
 */
export function prefetchDnsInfo(queryClient: QueryClient, dnsInfo: DnsInfo) {
  queryClient.setQueryData(DNS_INFO_QUERY_KEY, dnsInfo);
}

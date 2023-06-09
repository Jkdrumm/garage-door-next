import { QueryClient } from '@tanstack/react-query';
import { DNS_INFO_QUERY_KEY } from 'hooks/queries';
import { DnsService } from 'services';

/**
 * Sets the DNS information during prefetching.
 * @param queryClient {@link QueryClient}
 * @param dnsInfo The {@link DnsInfo}
 */
export function prefetchDnsInfo(queryClient: QueryClient) {
  const dnsService = DnsService.getInstance();
  const dnsInfo = {
    hostname: dnsService.getHostname(),
    isLoggedIn: dnsService.getIsLoggedIn(),
    isRunningHttps: dnsService.getIsRunningHttps()
  };
  queryClient.setQueryData(DNS_INFO_QUERY_KEY, dnsInfo);
}

import { QueryClient } from '@tanstack/react-query';
import { DNS_INFO_QUERY_KEY, DnsInfo } from 'hooks/queries';
import { DnsService } from 'services';

/**
 * Sets the DNS information during prefetching.
 * @param queryClient {@link QueryClient}
 * @param dnsInfo The {@link DnsInfo}
 */
export function prefetchDnsInfo(queryClient: QueryClient) {
  const dnsService = DnsService.getInstance();
  const dnsInfo: DnsInfo = {
    hostname: dnsService.getHostname(),
    isLoggedIn: dnsService.getIsLoggedIn(),
    isLoggingIn: dnsService.getIsLoggingIn(),
    isRunningHttps: dnsService.getIsRunningHttps(),
    isGettingCertificates: dnsService.getIsGettingCertificates(),
  };
  queryClient.setQueryData([DNS_INFO_QUERY_KEY], dnsInfo);
}

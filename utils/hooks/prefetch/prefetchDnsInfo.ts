import { QueryClient } from 'react-query';
import { DnsInfo, DNS_INFO_QUERY_KEY } from '../useDnsInfo';

export const prefetchDnsInfo = (queryClient: QueryClient, dnsInfo: DnsInfo) =>
  queryClient.setQueryData(DNS_INFO_QUERY_KEY, dnsInfo);

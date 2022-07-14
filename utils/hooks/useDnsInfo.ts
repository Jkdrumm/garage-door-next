import axios from 'axios';
import { useQuery, UseQueryResult } from 'react-query';
import { QueryOptions } from '../types';

export const DNS_INFO_QUERY_KEY = 'dnsInfo';
const API_ROUTE = '/api/dnsInfo';

const FETCH_FUNC = async () => (await axios.get(API_ROUTE)).data;

export const useDnsInfo = (options?: QueryOptions): UseQueryResult<DnsInfo> =>
  useQuery<DnsInfo>(DNS_INFO_QUERY_KEY, FETCH_FUNC, { refetchOnWindowFocus: false, ...options });

export interface DnsInfo {
  hostname: string | null;
  isLoggedIn: boolean;
  isRunningHttps: boolean;
}

import axios from 'axios';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { QueryOptions } from '../types';

export const DNS_INFO_QUERY_KEY = ['dnsInfo'];
const API_ROUTE = '/api/dnsInfo';

const FETCH_FUNC = () => axios.get(API_ROUTE).then(({ data }) => data);

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook to get the system DNS info.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export const useDnsInfo = (options?: QueryOptions): UseQueryResult<DnsInfo> =>
  useQuery<DnsInfo>(DNS_INFO_QUERY_KEY, FETCH_FUNC, options);

export interface DnsInfo {
  hostname: string | null;
  isLoggedIn: boolean;
  isRunningHttps: boolean;
}

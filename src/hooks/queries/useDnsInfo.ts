import { useContext } from 'react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { QueryOptions } from 'types';
import { WebSocketContextValue, WebSocketContext } from 'components';

export const DNS_INFO_QUERY_KEY = ['dnsInfo'];
const API_ROUTE = 'GET_DNS_INFO';

async function FETCH_FUNC(sendMessage: WebSocketContextValue['sendMessage']): Promise<DnsInfo> {
  return new Promise(resolve =>
    sendMessage(API_ROUTE, undefined, ({ data }) => {
      resolve(data);
    })
  );
}

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook to get the system DNS info.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export const useDnsInfo = (options?: QueryOptions): UseQueryResult<DnsInfo> => {
  const { sendMessage } = useContext(WebSocketContext);
  return useQuery<DnsInfo>(DNS_INFO_QUERY_KEY, () => FETCH_FUNC(sendMessage), options);
};

export interface DnsInfo {
  hostname: string | null;
  isLoggedIn: boolean;
  isRunningHttps: boolean;
}

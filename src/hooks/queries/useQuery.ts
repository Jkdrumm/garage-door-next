import {
  useQuery as useQueryReactQuery,
  UseQueryOptions as ReactQueryUseQueryOptions,
  UseQueryResult as ReactQueryUseQueryResult,
} from '@tanstack/react-query';
import { WebSocketContext } from 'components';
import { useContext } from 'react';
import { ClientEmitEvents, ClientEmitQueries } from 'types';

export type UseQueryOptions<TData = unknown, TQueryFnData = TData> = ReactQueryUseQueryOptions<
  TQueryFnData,
  { error: string },
  TData
>;
export type UseQueryResult<TData = unknown> = Omit<
  ReactQueryUseQueryResult<TData, { error: string }>,
  'queryKey' | 'queryFn'
>;

export type QueryKey = keyof ClientEmitQueries;

export function useQuery<TData = unknown, TQueryFnData = TData>(
  queryKey: [QueryKey, ...any[]],
  options?: UseQueryOptions<TData, TQueryFnData>,
): UseQueryResult<TData> {
  const { sendMessagePromise } = useContext(WebSocketContext);
  return useQueryReactQuery<TQueryFnData, { error: string }, TData>(
    queryKey,
    async () => {
      const [key, ...rest] = queryKey as any as [keyof ClientEmitEvents, any[]];
      const { data, error } = await sendMessagePromise(key, ...rest);
      if (error) return Promise.reject({ error });
      return data;
    },
    options,
  );
}

import { QueryKey, UseQueryOptions } from 'react-query';

export type QueryOptions = Omit<UseQueryOptions<any, unknown, any, QueryKey>, 'queryKey' | 'queryFn'>;

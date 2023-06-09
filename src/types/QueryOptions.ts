import { QueryKey, UseQueryOptions } from '@tanstack/react-query';

export type QueryOptions = Omit<UseQueryOptions<any, unknown, any, QueryKey>, 'queryKey' | 'queryFn'>;

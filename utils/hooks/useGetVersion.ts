import axios from 'axios';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { QueryOptions } from '../types';

export const VERSION_QUERY_KEY = ['version'];
const API_ROUTE = '/api/getVersion';

const FETCH_FUNC = () => axios.get(API_ROUTE).then(({ data }) => data);

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook to get the system DNS info.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export const useGetVersion = (options?: QueryOptions): UseQueryResult<string> =>
  useQuery<string>(VERSION_QUERY_KEY, FETCH_FUNC, options);

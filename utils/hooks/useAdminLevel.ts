import axios from 'axios';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AdminLevel } from '../enums';
import { QueryOptions } from '../types';

export const ADMIN_LEVEL_QUERY_KEY = ['adminLevel'];
const API_ROUTE = '/api/adminLevel';

const FETCH_FUNC = () => axios.get(API_ROUTE).then(({ data }) => data);

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook to get the AdminLevel of a user.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export const useAdminLevel = (options?: QueryOptions): UseQueryResult<AdminLevel> =>
  useQuery<number>(ADMIN_LEVEL_QUERY_KEY, FETCH_FUNC, options);

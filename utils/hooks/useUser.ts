import type { QueryOptions, User } from '../types';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';

export const USER_QUERY_KEY = ['user'];
const API_ROUTE = '/api/user';

const FETCH_FUNC = () => axios.get(API_ROUTE).then(({ data }) => data);

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook to get the user object.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export const useUser = (options?: QueryOptions): UseQueryResult<User> =>
  useQuery<User>(USER_QUERY_KEY, FETCH_FUNC, options);

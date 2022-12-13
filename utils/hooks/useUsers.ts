import axios from 'axios';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { QueryOptions, User } from '../types';

export const USERS_QUERY_KEY = ['users'];
const API_ROUTE = '/api/users';

const FETCH_FUNC = () => axios.get(API_ROUTE).then(({ data }) => data);

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook to get all users.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export const useUsers = (options?: QueryOptions): UseQueryResult<User[]> =>
  useQuery<User[]>(USERS_QUERY_KEY, FETCH_FUNC, options);

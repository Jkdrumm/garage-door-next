import axios from 'axios';
import { useQuery, UseQueryResult } from 'react-query';
import type { QueryOptions, User } from '../types';

export const USERS_QUERY_KEY = 'users';
const API_ROUTE = '/api/users';

const FETCH_FUNC = async () => (await axios.get(API_ROUTE)).data;

export const useUsers = (options?: QueryOptions): UseQueryResult<User[]> =>
  useQuery<User[]>(USERS_QUERY_KEY, FETCH_FUNC, { refetchOnWindowFocus: false, ...options });

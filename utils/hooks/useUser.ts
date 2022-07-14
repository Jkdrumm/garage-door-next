import type { QueryOptions, User } from '../types';
import { useQuery, UseQueryResult } from 'react-query';
import axios from 'axios';

export const USER_QUERY_KEY = 'user';
const API_ROUTE = '/api/user';

const FETCH_FUNC = async () => (await axios.get(API_ROUTE)).data;

export const useUser = (options?: QueryOptions): UseQueryResult<User> =>
  useQuery<User>(USER_QUERY_KEY, FETCH_FUNC, { refetchOnWindowFocus: false, ...options });

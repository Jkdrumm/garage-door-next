import axios from 'axios';
import { useQuery, UseQueryResult } from 'react-query';
import { QueryOptions } from '../types';

export const ADMIN_LEVEL_QUERY_KEY = 'adminLevel';
const API_ROUTE = '/api/adminLevel';

const FETCH_FUNC = async () => (await axios.get(API_ROUTE)).data;

export const useAdminLevel = (options?: QueryOptions): UseQueryResult<number> =>
  useQuery<number>(ADMIN_LEVEL_QUERY_KEY, FETCH_FUNC, { refetchOnWindowFocus: false, ...options });

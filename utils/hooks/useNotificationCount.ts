import axios from 'axios';
import { useQuery, UseQueryResult } from 'react-query';
import { QueryOptions } from '../types';

export const NOTIFICATION_QUERY_KEY = 'notifications';
const API_ROUTE = '/api/numNotifications';

const FETCH_FUNC = async () => (await axios.get(API_ROUTE)).data;

export const useNotificationCount = (options?: QueryOptions): UseQueryResult<number> =>
  useQuery<number>(NOTIFICATION_QUERY_KEY, FETCH_FUNC, { refetchOnWindowFocus: false, ...options });

import axios from 'axios';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { QueryOptions } from '../types';

export const NOTIFICATION_QUERY_KEY = ['notifications'];
const API_ROUTE = '/api/numNotifications';

const FETCH_FUNC = () => axios.get(API_ROUTE).then(({ data }) => data);

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook to get the notification count for a user.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export const useNotificationCount = (options?: QueryOptions): UseQueryResult<number> =>
  useQuery<number>(NOTIFICATION_QUERY_KEY, FETCH_FUNC, options);

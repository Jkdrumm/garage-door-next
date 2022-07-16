import { QueryClient } from 'react-query';
import { NOTIFICATION_QUERY_KEY } from '../useNotificationCount';

export const prefetchNotificationCount = (queryClient: QueryClient, numNotifications: number) =>
  queryClient.setQueryData(NOTIFICATION_QUERY_KEY, numNotifications);

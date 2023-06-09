import { QueryClient } from '@tanstack/react-query';
import { NOTIFICATION_QUERY_KEY } from 'hooks/queries';

/**
 * Sets the number of notifications during prefetching.
 * @param queryClient {@link QueryClient}
 * @param numNotifications The number of notifcations
 */
export function prefetchNotificationCount(queryClient: QueryClient, numNotifications: number) {
  queryClient.setQueryData(NOTIFICATION_QUERY_KEY, numNotifications);
}

import { QueryClient } from '@tanstack/react-query';
import { GARAGE_STATE_QUERY_KEY } from 'hooks';
import { GarageDoorService } from 'services';

/**
 * Preloads users data during prefetching.
 * @param queryClient {@link QueryClient}
 */
export function prefetchGarageDoorState(queryClient: QueryClient) {
  const doorState = GarageDoorService.getInstance().getDoorState();
  queryClient.setQueryData([GARAGE_STATE_QUERY_KEY], doorState);
}

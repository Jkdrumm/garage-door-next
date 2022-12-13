import { QueryClient } from '@tanstack/react-query';
import { AdminLevel } from '../../enums';
import { ADMIN_LEVEL_QUERY_KEY } from '../useAdminLevel';

/**
 * Sets the admin level during prefetching.
 * @param queryClient {@link QueryClient}
 * @param adminLevel The {@link AdminLevel}
 */
export function prefetchAdminLevel(queryClient: QueryClient, adminLevel: AdminLevel) {
  queryClient.setQueryData(ADMIN_LEVEL_QUERY_KEY, adminLevel);
}

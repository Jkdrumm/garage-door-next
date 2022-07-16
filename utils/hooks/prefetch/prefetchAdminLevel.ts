import { QueryClient } from 'react-query';
import { AdminLevel } from '../../enums';
import { ADMIN_LEVEL_QUERY_KEY } from '../useAdminLevel';

export const prefetchAdminLevel = (queryClient: QueryClient, adminLevel: AdminLevel) =>
  queryClient.setQueryData(ADMIN_LEVEL_QUERY_KEY, adminLevel);

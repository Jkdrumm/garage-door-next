import { QueryClient } from 'react-query';
import { AdminLevel } from '../../enums';
import { ADMIN_LEVEL_QUERY_KEY } from '../useAdminLevel';

export const prefetchAdminLevel = async (queryClient: QueryClient, adminLevel: AdminLevel) =>
  await queryClient.prefetchQuery(ADMIN_LEVEL_QUERY_KEY, () => adminLevel);

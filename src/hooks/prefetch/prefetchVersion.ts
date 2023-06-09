import { QueryClient } from '@tanstack/react-query';
import { VERSION_QUERY_KEY } from 'hooks/queries';
import { VersionService } from 'services';

/**
 * Sets the DNS information during prefetching.
 * @param queryClient {@link QueryClient}
 * @param dnsInfo The {@link DnsInfo}
 */
export async function prefetchVersion(queryClient: QueryClient) {
  const versionService = VersionService.getInstance();
  const versionInfo = {
    version: await versionService.getVersion(),
    timeOfLastCheck: versionService.getLastCheckedForUpdate()?.toLocaleString(),
    isCurrentlyUpdating: versionService.getIsCurrentlyUpdating()
  };
  queryClient.setQueryData(VERSION_QUERY_KEY, versionInfo);
}

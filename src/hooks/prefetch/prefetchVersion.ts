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
  let versionInfo = undefined;
  // Only set the version if we have one cached and it hasn't been too long, otherwise the page takes too long to load.
  if (!versionService.shouldCheckForUpdate()) {
    const version = versionService.getVersionForPrefetch();
    if (version)
      versionInfo = {
        version,
        timeOfLastCheck: versionService.getLastCheckedForUpdate()?.toLocaleString(),
        isCurrentlyUpdating: versionService.getIsCurrentlyUpdating()
      };
  }

  queryClient.setQueryData(VERSION_QUERY_KEY, versionInfo);
}

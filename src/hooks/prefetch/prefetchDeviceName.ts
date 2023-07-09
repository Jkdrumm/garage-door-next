import { QueryClient } from '@tanstack/react-query';
import { DEVICE_NAME_QUERY_KEY } from 'hooks/queries';
import { SettingsService } from 'services';

/**
 * Sets the device name during prefetching.
 * @param queryClient {@link QueryClient}
 * @param dnsInfo The {@link DnsInfo}
 */
export function prefetchDeviceName(queryClient: QueryClient) {
  queryClient.setQueryData([DEVICE_NAME_QUERY_KEY], SettingsService.getInstance().getDeviceName());
}

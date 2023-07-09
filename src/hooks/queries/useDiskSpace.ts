import { useQuery, UseQueryOptions } from './useQuery';

export const DISK_SPACE_QUERY_KEY = 'GET_DISK_SPACE';

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook to get the disk space info.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export function useDiskSpace(options?: UseQueryOptions<DiskSpaceData>) {
  return useQuery<DiskSpaceData>([DISK_SPACE_QUERY_KEY], options);
}

export type DiskSpaceData = {
  available: number;
  size: number;
};

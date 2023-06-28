import { useQuery, UseQueryOptions } from './useQuery';

export const VERSION_QUERY_KEY = 'GET_VERSION';

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook to get the version of the newest update.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export function useVersion(options?: UseQueryOptions<VersionData>) {
  return useQuery<VersionData>([VERSION_QUERY_KEY], options);
}

export type VersionData = {
  version: string;
  timeOfLastCheck: string;
  isCurrentlyUpdating: boolean;
};

import { useQueryClient } from '@tanstack/react-query';
import { VERSION_QUERY_KEY, VersionData } from 'hooks/queries';
import { useMutation, UseMutationOptions } from './useMutation';

export const CHECK_FOR_NEW_VERSION_QUERY_KEY = 'CHECK_FOR_NEW_VERSION';

export type CheckForNewVersionData = Omit<VersionData, 'isCurrentlyUpdating'>;

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook to check for a new version update.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export function useCheckForNewVersion(options?: UseMutationOptions<CheckForNewVersionData>) {
  const queryClient = useQueryClient();
  return useMutation<CheckForNewVersionData>([CHECK_FOR_NEW_VERSION_QUERY_KEY], {
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData<VersionData>([VERSION_QUERY_KEY], prev => ({
        version: data.version,
        timeOfLastCheck: data.timeOfLastCheck,
        isCurrentlyUpdating: prev?.isCurrentlyUpdating ?? false,
      }));
      options?.onSuccess?.(data, variables, context);
    },
  });
}

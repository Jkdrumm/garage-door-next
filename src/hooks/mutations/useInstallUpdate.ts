import { useQueryClient } from '@tanstack/react-query';
import { useMutation, UseMutationOptions } from './useMutation';
import { VERSION_QUERY_KEY, VersionData } from 'hooks';

export const INSTALL_UPDATE_QUERY_KEY = 'INSTALL_UPDATE';

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/react/reference/useMutation useMutation} hook to press the garage door button.
 * @param options The React Query Options
 * @returns A useMutation hook
 */
export function useInstallUpdate(options?: UseMutationOptions<VersionData>) {
  const queryClient = useQueryClient();
  return useMutation<VersionData>([INSTALL_UPDATE_QUERY_KEY], {
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData<VersionData>([VERSION_QUERY_KEY], prevData => {
        if (!prevData) return undefined;
        return { ...prevData, isCurrentlyUpdating: true };
      });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

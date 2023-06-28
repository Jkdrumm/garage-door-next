import { useQuery, UseQueryOptions } from './useQuery';

export const UPDATE_COMPLETE_QUERY_KEY = 'updateComplete';

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook determine if the update has completed.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export function useUpdateComplete(options?: UseQueryOptions<boolean>) {
  return useQuery<boolean>([UPDATE_COMPLETE_QUERY_KEY] as any, {
    initialData: false,
    ...options,
  });
}

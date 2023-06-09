import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { QueryOptions } from 'types';

export const UPDATE_COMPLETE_QUERY_KEY = ['updateComplete'];

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook determine if the update has completed.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export const useUpdateComplete = (options?: QueryOptions): UseQueryResult<boolean> => {
  return useQuery<boolean>(UPDATE_COMPLETE_QUERY_KEY, () => Promise.resolve(false), {
    initialData: false,
    ...options
  });
};

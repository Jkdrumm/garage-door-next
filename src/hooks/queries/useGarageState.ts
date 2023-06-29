import { useQuery, UseQueryOptions } from './useQuery';
import { GarageState } from 'enums';

export const GARAGE_STATE_QUERY_KEY = 'GET_GARAGE_STATE';

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/reference/useQuery useQuery} hook to get the state of the garage.
 * @param options The React Query Options
 * @returns A useQuery hook
 */
export function useGarageState(options?: UseQueryOptions<GarageState>) {
  return useQuery<GarageState>([GARAGE_STATE_QUERY_KEY], {
    initialData: GarageState.FETCHING,
    ...options,
  });
}

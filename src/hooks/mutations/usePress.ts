import { useMutation, UseMutationOptions } from './useMutation';

export const PRESS_QUERY_KEY = 'PRESS';
/**
 * A React Query {@link https://tanstack.com/query/v4/docs/react/reference/useMutation useMutation} hook to press the garage door button.
 * @param options The React Query Options
 * @returns A useMutation hook
 */
export function usePress(options?: UseMutationOptions) {
  return useMutation([PRESS_QUERY_KEY], options);
}

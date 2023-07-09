import { useQueryClient } from '@tanstack/react-query';
import { DEVICE_NAME_QUERY_KEY } from 'hooks/queries';
import { useMutation, UseMutationOptions } from './useMutation';

export const UPDATE_DEVICE_NAME_QUERY_KEY = 'UPDATE_DEVICE_NAME';

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/react/reference/useMutation useMutation} hook update the device name.
 * @param options The React Query Options
 * @returns A useMutation hook
 */
export function useUpdateDeviceName(options?: UseMutationOptions<void, { deviceName: string }>) {
  const queryClient = useQueryClient();
  return useMutation<void, { deviceName: string }>([UPDATE_DEVICE_NAME_QUERY_KEY], {
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData<string>([DEVICE_NAME_QUERY_KEY], variables.deviceName);
      options?.onSuccess?.(data, variables, context);
    },
  });
}

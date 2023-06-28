import { useQueryClient } from '@tanstack/react-query';
import { User } from 'types';
import { USER_QUERY_KEY, USERS_QUERY_KEY } from 'hooks/queries';
import { useMutation, UseMutationOptions } from './useMutation';

export const UPDATE_PROFILE_QUERY_KEY = 'UPDATE_PROFILE';

type UpdateUserParameters = { firstName?: string; lastName?: string; password?: string };

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/react/reference/useMutation useMutation} hook to update the user's profile.
 * @param options The React Query Options
 * @returns A useMutation hook
 */
export const useUpdateProfile = (options?: UseMutationOptions<void, UpdateUserParameters>) => {
  const queryClient = useQueryClient();
  return useMutation<void, UpdateUserParameters>([UPDATE_PROFILE_QUERY_KEY], {
    ...options,
    onSuccess: (data, variables, context) => {
      const userId = (queryClient.getQueryData<User>([USER_QUERY_KEY]) as User).id;
      queryClient.setQueryData<User>([USER_QUERY_KEY], queryData => {
        if (queryData === undefined) return undefined;
        if (variables.firstName) queryData.firstName = variables.firstName;
        if (variables.lastName) queryData.lastName = variables.lastName;
        return queryData;
      });
      queryClient.setQueryData<User[]>([USERS_QUERY_KEY], queryData => {
        const updatedUser = queryData?.find(user => user.id === userId);
        if (updatedUser) {
          if (variables.firstName) updatedUser.firstName = variables.firstName;
          if (variables.lastName) updatedUser.lastName = variables.lastName;
        }
        return queryData;
      });
      options?.onSuccess?.(data, variables, context);
    },
  });
};

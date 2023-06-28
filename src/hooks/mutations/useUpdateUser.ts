import { useQueryClient } from '@tanstack/react-query';
import { User } from 'types';
import { UserLevel } from 'enums';
import { USERS_QUERY_KEY } from 'hooks/queries';
import { useMutation, UseMutationOptions } from './useMutation';

export const UPDATE_USER_QUERY_KEY = 'UPDATE_USER';

type UpdateUserParameters = { id: string; userLevel: UserLevel };

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/react/reference/useMutation useMutation} hook to update a user.
 * @param options The React Query Options
 * @returns A useMutation hook
 */
export function useUpdateUser(options?: UseMutationOptions<void, UpdateUserParameters>) {
  const queryClient = useQueryClient();
  return useMutation<void, UpdateUserParameters>([UPDATE_USER_QUERY_KEY], {
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData<number>(['notifications'], queryData => {
        if (queryData === undefined) queryData = 0;
        if (variables.userLevel === UserLevel.ACCOUNT) return queryData + 1;
        if (
          queryClient.getQueryData<User[]>([USERS_QUERY_KEY])?.find(user => user.id === variables.id)?.userLevel ===
          UserLevel.ACCOUNT
        )
          return queryData - 1;
        return queryData;
      });
      queryClient.setQueryData<User[]>([USERS_QUERY_KEY], queryData => {
        const updatedUser = queryData?.find(user => user.id === variables.id);
        if (updatedUser) updatedUser.userLevel = variables.userLevel;
        return queryData;
      });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

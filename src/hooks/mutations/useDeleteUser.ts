import { useQueryClient } from '@tanstack/react-query';
import { User } from 'types';
import { useMutation, UseMutationOptions } from './useMutation';
import { UserLevel } from 'enums';
import { USERS_QUERY_KEY } from 'hooks/queries';

export const DELETE_USER_QUERY_KEY = 'DELETE_USER';

type DeleteUserParameters = { id: string };

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/react/reference/useMutation useMutation} hook to delete a user.
 * @param options The React Query Options
 * @returns A useMutation hook
 */
export function useDeleteUser(options?: UseMutationOptions<boolean, DeleteUserParameters>) {
  const queryClient = useQueryClient();
  return useMutation<boolean, DeleteUserParameters>([DELETE_USER_QUERY_KEY], {
    ...options,
    onSuccess: (data, variables, context) => {
      const userLevel = queryClient
        .getQueryData<User[]>([USERS_QUERY_KEY])
        ?.find((user: User) => user.id === variables.id)?.userLevel;
      queryClient.setQueryData<User[]>([USERS_QUERY_KEY], queryData => {
        const filteredData = queryData?.filter((user: User) => user.id !== variables.id);
        return filteredData;
      });
      if (userLevel === UserLevel.ACCOUNT)
        queryClient.setQueryData(['notifications'], (queryData: any) => queryData - 1);
      options?.onSuccess?.(data, variables, context);
    },
  });
}

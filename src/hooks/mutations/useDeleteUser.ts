import { useContext } from 'react';
import { useMutation, UseMutationOptions, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { User } from 'types';
import { WebSocketContextValue, WebSocketContext } from 'components';
import { UserLevel } from 'enums';
import { USERS_QUERY_KEY } from 'hooks/queries';

export const DELETE_USER_QUERY_KEY = ['deleteUser'];
const API_ROUTE = 'DELETE_USER';

async function FETCH_FUNC(sendMessage: WebSocketContextValue['sendMessage'], id: string): Promise<void> {
  return new Promise((resolve, reject) =>
    sendMessage(API_ROUTE, { id }, ({ error }) => {
      if (error) reject(error);
      else resolve();
    })
  );
}

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/react/reference/useMutation useMutation} hook to delete a user.
 * @param options The React Query Options
 * @returns A useMutation hook
 */
export const useDeleteUser = (
  options?: UseMutationOptions<void, unknown, { id: string; userLevel: UserLevel }, unknown>
): Omit<
  UseMutationResult<void, unknown, { id: string; userLevel: UserLevel }, unknown>,
  'mutationKey' | 'mutationFn'
> => {
  const { sendMessage } = useContext(WebSocketContext);
  const queryClient = useQueryClient();
  return useMutation<void, unknown, { id: string; userLevel: UserLevel }, unknown>(
    DELETE_USER_QUERY_KEY,
    ({ id }) => FETCH_FUNC(sendMessage, id),
    {
      ...options,
      onSuccess: (data, variables, context) => {
        queryClient.setQueryData<User[]>(USERS_QUERY_KEY, queryData => {
          const filteredData = queryData?.filter((user: User) => user.id !== variables.id);
          return filteredData;
        });
        if (variables.userLevel === UserLevel.ACCOUNT)
          queryClient.setQueryData(['notifications'], (queryData: any) => queryData - 1);
        options?.onSuccess?.(data, variables, context);
      }
    }
  );
};

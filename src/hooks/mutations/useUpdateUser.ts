import { useContext } from 'react';
import { useMutation, UseMutationOptions, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { User } from 'types';
import { WebSocketContextValue, WebSocketContext } from 'components';
import { UserLevel } from 'enums';
import { USERS_QUERY_KEY } from 'hooks/queries';

export const UPDATE_USER_QUERY_KEY = ['updateUser'];
const API_ROUTE = 'UPDATE_USER';

async function FETCH_FUNC(
  sendMessage: WebSocketContextValue['sendMessage'],
  payload: { id: string; userLevel: UserLevel }
): Promise<void> {
  return new Promise((resolve, reject) =>
    sendMessage(API_ROUTE, payload, ({ error }) => {
      if (error) reject(error);
      else resolve();
    })
  );
}

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/react/reference/useMutation useMutation} hook to update a user.
 * @param options The React Query Options
 * @returns A useMutation hook
 */
export const useUpdateUser = (
  options?: UseMutationOptions<void, unknown, { id: string; userLevel: UserLevel }, unknown>
): Omit<
  UseMutationResult<void, unknown, { id: string; userLevel: UserLevel }, unknown>,
  'mutationKey' | 'mutationFn'
> => {
  const { sendMessage } = useContext(WebSocketContext);
  const queryClient = useQueryClient();
  return useMutation<void, unknown, { id: string; userLevel: UserLevel }, unknown>(
    UPDATE_USER_QUERY_KEY,
    args => FETCH_FUNC(sendMessage, args),
    {
      ...options,
      onSuccess: (data, variables, context) => {
        queryClient.setQueryData<number>(['notifications'], queryData => {
          if (queryData === undefined) queryData = 0;
          if (variables.userLevel === UserLevel.ACCOUNT) return queryData + 1;
          if (
            queryClient.getQueryData<User[]>(USERS_QUERY_KEY)?.find(user => user.id === variables.id)?.userLevel ===
            UserLevel.ACCOUNT
          )
            return queryData - 1;
          return queryData;
        });
        queryClient.setQueryData<User[]>(USERS_QUERY_KEY, queryData => {
          const updatedUser = queryData?.find(user => user.id === variables.id);
          if (updatedUser) updatedUser.userLevel = variables.userLevel;
          return queryData;
        });
        options?.onSuccess?.(data, variables, context);
      }
    }
  );
};

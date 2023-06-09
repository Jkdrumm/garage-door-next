import { useContext } from 'react';
import { useMutation, UseMutationOptions, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { User } from 'types';
import { WebSocketContextValue, WebSocketContext } from 'components';
import { USER_QUERY_KEY, USERS_QUERY_KEY } from 'hooks/queries';

export const UPDATE_PROFILE_QUERY_KEY = ['updateProfile'];
const API_ROUTE = 'UPDATE_PROFILE';

type UpdateUserParameters = { firstName?: string; lastName?: string; password?: string };

async function FETCH_FUNC(
  sendMessage: WebSocketContextValue['sendMessage'],
  payload: UpdateUserParameters
): Promise<void> {
  return new Promise((resolve, reject) =>
    sendMessage(API_ROUTE, payload, ({ error }) => {
      if (error) reject(error);
      else resolve();
    })
  );
}

/**
 * A React Query {@link https://tanstack.com/query/v4/docs/react/reference/useMutation useMutation} hook to update the user's profile.
 * @param options The React Query Options
 * @returns A useMutation hook
 */
export const useUpdateProfile = (
  options?: UseMutationOptions<void, unknown, UpdateUserParameters, unknown>
): Omit<UseMutationResult<void, unknown, UpdateUserParameters, unknown>, 'mutationKey' | 'mutationFn'> => {
  const { sendMessage } = useContext(WebSocketContext);
  const queryClient = useQueryClient();
  return useMutation<void, unknown, UpdateUserParameters, unknown>(
    UPDATE_PROFILE_QUERY_KEY,
    args => FETCH_FUNC(sendMessage, args),
    {
      ...options,
      onSuccess: (data, variables, context) => {
        const userId = (queryClient.getQueryData<User>(USER_QUERY_KEY) as User).id;
        queryClient.setQueryData<User>(USER_QUERY_KEY, queryData => {
          if (queryData === undefined) return undefined;
          if (variables.firstName) queryData.firstName = variables.firstName;
          if (variables.lastName) queryData.lastName = variables.lastName;
          return queryData;
        });
        queryClient.setQueryData<User[]>(USERS_QUERY_KEY, queryData => {
          const updatedUser = queryData?.find(user => user.id === userId);
          if (updatedUser) {
            if (variables.firstName) updatedUser.firstName = variables.firstName;
            if (variables.lastName) updatedUser.lastName = variables.lastName;
          }
          return queryData;
        });
        options?.onSuccess?.(data, variables, context);
      }
    }
  );
};

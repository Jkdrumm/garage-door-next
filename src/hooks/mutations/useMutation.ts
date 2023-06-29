import {
  useMutation as useMutationReactQuery,
  UseMutationOptions as ReactQueryUseMutationOptions,
  UseMutationResult as ReactQueryUseMutationResult,
} from '@tanstack/react-query';
import { WebSocketContext } from 'components';
import { useContext } from 'react';
import { ClientEmitMutations } from 'types';

export type UseMutationOptions<TData = void, TVariables = void> = ReactQueryUseMutationOptions<
  TData,
  { error: string },
  TVariables,
  unknown
>;
export type UseMutationResult<TData = void, TVariables = void> = Omit<
  ReactQueryUseMutationResult<TData, { error: string }, TVariables, unknown>,
  'mutationKey' | 'mutationFn'
>;

export type MutationKey = keyof ClientEmitMutations;

export function useMutation<TData = void, TVariables = void>(
  mutationKey: [MutationKey, ...any[]],
  options?: UseMutationOptions<TData, TVariables>,
): UseMutationResult<TData, TVariables> {
  const { sendMessagePromise } = useContext(WebSocketContext);
  return useMutationReactQuery<TData, { error: string }, TVariables, unknown>(
    [mutationKey],
    async (...args) => {
      const { data, error } = await sendMessagePromise(mutationKey[0], ...args);
      if (error) return Promise.reject({ error });
      return data;
    },
    options,
  );
}

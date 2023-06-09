import { QueryClient } from '@tanstack/react-query';
import { USERS_QUERY_KEY } from 'hooks';
import { User } from 'types';
import { Socket } from 'socket.io-client';

export function addNewUserListener(socket: Socket, queryClient: QueryClient) {
  socket.on('NEW_USER', (user: User) => {
    queryClient.setQueryData<User[]>(USERS_QUERY_KEY, prevData => (prevData ? [...prevData, user] : undefined));
  });
}

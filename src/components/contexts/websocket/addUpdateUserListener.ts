import { QueryClient } from '@tanstack/react-query';
import { USERS_QUERY_KEY } from 'hooks';
import { User } from 'types';
import { Socket } from 'socket.io-client';

export function addUpdateUserListener(socket: Socket, queryClient: QueryClient) {
  socket.on('USER_UPDATED', (user: Partial<User>) => {
    queryClient.setQueryData<User[]>(USERS_QUERY_KEY, prevData => {
      if (!prevData) return undefined;
      const userIndex = prevData.findIndex(cachedUser => cachedUser.id === user.id);
      const usersCopy = [...prevData];
      usersCopy[userIndex] = { ...prevData[userIndex], ...user };
      return usersCopy;
    });
  });
}

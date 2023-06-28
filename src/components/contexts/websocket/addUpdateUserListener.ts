import { QueryClient } from '@tanstack/react-query';
import { USERS_QUERY_KEY } from 'hooks';
import { ClientSocket, User } from 'types';

export function addUpdateUserListener(socket: ClientSocket, queryClient: QueryClient) {
  socket.on('USER_UPDATED', user => {
    queryClient.setQueryData<User[]>([USERS_QUERY_KEY], prevData => {
      if (!prevData) return undefined;
      const userIndex = prevData.findIndex(cachedUser => cachedUser.id === user.id);
      const usersCopy = [...prevData];
      usersCopy[userIndex] = { ...prevData[userIndex], ...user };
      return usersCopy;
    });
  });
}

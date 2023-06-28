import { QueryClient } from '@tanstack/react-query';
import { USERS_QUERY_KEY } from 'hooks';
import { ClientSocket, User } from 'types';

export function addUserDeletedListener(socket: ClientSocket, queryClient: QueryClient) {
  socket.on('USER_DELETED', id => {
    queryClient.setQueryData<User[]>([USERS_QUERY_KEY], prevData => {
      if (!prevData) return undefined;
      const index = prevData.findIndex(user => user.id === id);
      if (index === -1) return prevData;
      const newData = [...prevData];
      newData.splice(index, 1);
      return newData;
    });
  });
}

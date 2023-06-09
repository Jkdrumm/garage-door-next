import { QueryClient } from '@tanstack/react-query';
import { USERS_QUERY_KEY } from 'hooks';
import { User } from 'types';
import { Socket } from 'socket.io-client';

export function addUserDeletedListener(socket: Socket, queryClient: QueryClient) {
  socket.on('USER_DELETED', ({ id }: { id: string }) => {
    queryClient.setQueryData<User[]>(USERS_QUERY_KEY, prevData => {
      if (!prevData) return undefined;
      const index = prevData.findIndex(user => user.id === id);
      if (index === -1) return prevData;
      const newData = [...prevData];
      newData.splice(index, 1);
      return newData;
    });
  });
}

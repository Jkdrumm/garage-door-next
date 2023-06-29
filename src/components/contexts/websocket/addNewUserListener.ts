import { QueryClient } from '@tanstack/react-query';
import { USERS_QUERY_KEY } from 'hooks';
import { ClientSocket, User } from 'types';

export function addNewUserListener(socket: ClientSocket, queryClient: QueryClient) {
  socket.on('NEW_USER', (user: User) => {
    queryClient.setQueryData<User[]>([USERS_QUERY_KEY], prevData => (prevData ? [...prevData, user] : undefined));
  });
}

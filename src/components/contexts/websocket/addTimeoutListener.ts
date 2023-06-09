import { QueryClient } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';
import { Socket } from 'socket.io-client';
import router from 'next/router';

export function addTimeoutListener(socket: Socket, queryClient: QueryClient) {
  socket.on('SESSION_TIMEOUT', async () => {
    queryClient.clear();
    socket.removeAllListeners();
    socket.disconnect();
    await signOut({ redirect: false });
    await router.push('/');
  });
}

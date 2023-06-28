import { ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { WebSocketContext } from './WebSocketContext';
import { addEventListeners } from './websocket';
import { ClientSocket } from 'types';

type EmitParams = Parameters<ClientSocket['emit' | 'emitWithAck']>;

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const webSocket = useRef<ClientSocket>();
  const queryClient = useQueryClient();
  const { status } = useSession();
  const router = useRouter();
  // eslint-disable-next-line no-unused-vars
  const onConnectEvents = useRef<{ event: EmitParams; resolve?: (value: any) => void }[]>([]);

  const sendMessage = useCallback((...event: Parameters<ClientSocket['emit']>) => {
    if (webSocket.current?.connected) webSocket.current.emit.apply(webSocket.current, event);
    else onConnectEvents.current.push({ event });
  }, []) as ClientSocket['emit'];

  const sendMessagePromise = useCallback((...event: Parameters<ClientSocket['emitWithAck']>) => {
    if (webSocket.current?.connected) return webSocket.current.emitWithAck.apply(webSocket.current, event);
    return new Promise(resolve => {
      onConnectEvents.current.push({ event, resolve });
    });
  }, []) as ClientSocket['emitWithAck'];

  const pressButton = useCallback(() => {
    sendMessage('PRESS');
  }, [sendMessage]);

  const { mutate: connectWebsocket } = useMutation(['socket'], () => axios.post('/api/socket'), {
    onSuccess: () => {
      socketInitializer();
    },
  });

  useEffect(() => {
    if (status === 'authenticated') connectWebsocket();
    return () => {
      webSocket?.current?.removeAllListeners();
      webSocket?.current?.disconnect();
    };
  }, [connectWebsocket, status]);

  const disconnectWebsocket = useCallback(async () => {
    webSocket?.current?.removeAllListeners();
    webSocket?.current?.disconnect();
    await signOut({ redirect: false });
    await router.push('/');
  }, [router]);

  const socketInitializer = useCallback(() => {
    const socket: ClientSocket = io();
    socket.on('connect', () => {
      addEventListeners(socket, queryClient);

      onConnectEvents.current.forEach(({ event, resolve }) => {
        if (resolve) resolve(webSocket.current?.emitWithAck.apply(webSocket.current, event));
        else webSocket.current?.emit.apply(webSocket.current, event as any);
      });
      onConnectEvents.current = [];
    });

    socket.on('disconnect', () => {
      setTimeout(socketInitializer, 10000);
    });

    webSocket.current = socket;
  }, [queryClient]);

  const providerValue = useMemo(
    () => ({
      isWebsocketConnected: webSocket.current?.connected ?? false,
      sendMessage,
      sendMessagePromise,
      disconnectWebsocket,
      pressButton,
    }),
    [sendMessage, sendMessagePromise, disconnectWebsocket, pressButton],
  );

  return <WebSocketContext.Provider value={providerValue}>{children}</WebSocketContext.Provider>;
};

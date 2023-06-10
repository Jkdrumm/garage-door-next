import { ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { Socket, io } from 'socket.io-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { WebSocketContext } from './WebSocketContext';
import { GarageRequestType } from 'enums';
import { addEventListeners } from './websocket';

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const webSocket = useRef<Socket>();
  const queryClient = useQueryClient();
  const { status } = useSession();
  const router = useRouter();
  // eslint-disable-next-line no-unused-vars
  const onConnectEvents = useRef<((...args: any[]) => void)[]>([]);

  // eslint-disable-next-line no-unused-vars
  const sendMessage = useCallback((message: GarageRequestType, payload?: any, ack?: (...args: any[]) => void) => {
    const sendMessage = () => webSocket?.current?.emit(message, payload, ack);
    if (webSocket.current?.connected) sendMessage();
    else onConnectEvents.current.push(sendMessage);
  }, []);

  const pressButton = useCallback(() => {
    sendMessage('PRESS');
  }, [sendMessage]);

  const { mutate: connectWebsocket } = useMutation(['socket'], () => axios.post('/api/socket'), {
    onSuccess: () => {
      socketInitializer();
    }
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
    const socket = io();
    socket.on('connect', () => {
      addEventListeners(socket, queryClient);

      onConnectEvents.current.forEach(event => event());
      onConnectEvents.current = [];
    });

    socket.on('error', (error: any) => console.error(error));

    socket.on('disconnect', () => {
      setTimeout(socketInitializer, 10000);
    });

    webSocket.current = socket;
  }, [queryClient]);

  const providerValue = useMemo(
    () => ({
      isWebsocketConnected: webSocket.current?.connected ?? false,
      sendMessage,
      disconnectWebsocket,
      pressButton
    }),
    [sendMessage, disconnectWebsocket, pressButton]
  );

  return <WebSocketContext.Provider value={providerValue}>{children}</WebSocketContext.Provider>;
};

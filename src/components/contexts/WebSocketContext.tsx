/* eslint-disable no-unused-vars */
import { createContext } from 'react';
import { ClientSocket } from 'types';

export type WebSocketContextValue = {
  isWebsocketConnected: boolean;
  sendMessage: ClientSocket['emit'];
  sendMessagePromise: ClientSocket['emitWithAck'];
  disconnectWebsocket: () => Promise<void>;
  pressButton: () => void;
};

export const WebSocketContext = createContext<WebSocketContextValue>({} as WebSocketContextValue);

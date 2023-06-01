import React, { MutableRefObject } from 'react';
import { Socket } from 'socket.io-client';

export type WebSocketContextValue = {
  webSocket: MutableRefObject<Socket | undefined>;
};

export const WebSocketContext = React.createContext<WebSocketContextValue>({} as WebSocketContextValue);

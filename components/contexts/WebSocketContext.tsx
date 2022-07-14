import React, { Dispatch, SetStateAction } from 'react';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

export type WebSocketContextValue = {
  webSocket?: Socket;
  setWebSocket?: Dispatch<SetStateAction<Socket<DefaultEventsMap, DefaultEventsMap> | undefined>>;
};

export const WebSocketContext = React.createContext<WebSocketContextValue>({});

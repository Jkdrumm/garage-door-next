import { ReactNode, useState } from 'react';
import { Socket } from 'socket.io-client';
import { WebSocketContext } from './WebSocketContext';

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [webSocket, setWebSocket] = useState<Socket>();

  return <WebSocketContext.Provider value={{ webSocket, setWebSocket }}>{children}</WebSocketContext.Provider>;
};

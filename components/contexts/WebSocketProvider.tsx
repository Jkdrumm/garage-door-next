import { ReactNode, useMemo, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { WebSocketContext } from './WebSocketContext';

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const webSocket = useRef<Socket>();
  const value = useMemo(() => ({ webSocket }), [webSocket]);

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

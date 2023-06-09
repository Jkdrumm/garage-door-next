import { createContext } from 'react';
import { GarageRequestType } from 'enums';

export type WebSocketContextValue = {
  isWebsocketConnected: boolean;
  sendMessage: <T = any>(
    // eslint-disable-next-line no-unused-vars
    message: GarageRequestType,
    // eslint-disable-next-line no-unused-vars
    payload?: any,
    // eslint-disable-next-line no-unused-vars
    ack?: (({ data, error }: { data: T; error?: string }) => void) | undefined
  ) => void;
  disconnectWebsocket: () => Promise<void>;
  pressButton: () => void;
};

export const WebSocketContext = createContext<WebSocketContextValue>({} as WebSocketContextValue);

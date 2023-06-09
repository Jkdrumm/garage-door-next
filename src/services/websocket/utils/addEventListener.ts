import { Socket } from 'socket.io';
import { GarageRequestType, UserLevel } from '../../../enums';
import { WebSocketService } from '../../WebSocketService';
import { sendUnauthorized } from './sendUnauthorized';

type AddEventListenerOptions = {
  failureDataFn?: DataFn;
  userLevel: UserLevel;
};

// eslint-disable-next-line no-unused-vars
type DataFn = (payload: any) => Promise<any> | any;

const defaultAddEventListenerOptions: AddEventListenerOptions = {
  failureDataFn: sendUnauthorized,
  userLevel: UserLevel.ADMIN
};

export function addEventListener(
  socket: Socket,
  id: string,
  type: GarageRequestType,
  dataFn: DataFn,
  options?: AddEventListenerOptions
) {
  const { failureDataFn, userLevel } = { ...defaultAddEventListenerOptions, ...options };
  socket.on(type, async (payload, ack) => {
    const webSocketClients = WebSocketService.getInstance().getWebsocketClients();
    const userSockets = webSocketClients[id];
    const hasAcknowledgement = typeof ack === 'function';
    let result = null;
    try {
      if (userSockets.userLevel < userLevel) {
        const error = await failureDataFn?.(payload);
        result = { error };
      } else {
        const data = await dataFn(payload);
        result = { data };
      }
    } catch (error) {
      result = { error };
    }
    if (hasAcknowledgement) ack({ ...result });
  });
}

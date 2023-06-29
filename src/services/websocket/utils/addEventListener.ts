import { Socket } from 'socket.io';
import { UserLevel } from 'enums';
import { WebSocketService } from 'services';
import { ClientEmitEvents } from 'types';
import { sendUnauthorized } from './sendUnauthorized';
import { sendError } from './sendError';

type AddEventListenerOptions = {
  failureDataFn?: ErrorFn;
  userLevel?: UserLevel;
};

// eslint-disable-next-line no-unused-vars
type ErrorFn = (error: any, ...args: any[]) => any;

// eslint-disable-next-line no-unused-vars
type DataFn = (...args: any[]) => any;

const defaultAddEventListenerOptions: Required<AddEventListenerOptions> = {
  failureDataFn: sendError,
  userLevel: UserLevel.ADMIN,
};

export function addEventListener(
  socket: Socket,
  id: string,
  type: keyof ClientEmitEvents,
  dataFn: DataFn,
  options?: AddEventListenerOptions,
) {
  const { failureDataFn, userLevel } = { ...defaultAddEventListenerOptions, ...options };
  socket.on(type, async (...args) => {
    let ack = undefined;
    if (typeof args[args.length - 1] === 'function') ack = args.pop();
    const webSocketClients = WebSocketService.getInstance().getWebsocketClients();
    const userSockets = webSocketClients[id];
    const hasAcknowledgement = typeof ack === 'function';
    let result = null;
    try {
      if (userSockets.userLevel < userLevel) result = { error: sendUnauthorized() };
      else {
        const data = await dataFn(...args);
        result = { data };
      }
    } catch (catchError) {
      console.error(catchError);
      const error = await failureDataFn(catchError, ...args);
      if (error) {
        result = { error };
      } else result = { error: sendError() };
    }
    if (hasAcknowledgement) ack({ ...result });
  });
}

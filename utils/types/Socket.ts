import type { Socket as SocketIOSocket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

export type Socket = SocketIOSocket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

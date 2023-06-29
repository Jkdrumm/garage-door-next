import type { Socket } from 'socket.io-client';
import type { ServerEmitEvents } from './ServerEmitEvents';
import type { ClientEmitEvents } from './ClientEmitEvents';

export type ClientSocket = Socket<ServerEmitEvents, ClientEmitEvents>;

import type { Socket } from 'socket.io';
import type { ClientEmitEvents } from './ClientEmitEvents';
import type { ServerEmitEvents } from './ServerEmitEvents';

export type ServerSocket = Socket<ClientEmitEvents, ServerEmitEvents>;

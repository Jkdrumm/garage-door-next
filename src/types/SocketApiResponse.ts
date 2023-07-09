import type { NextApiResponse } from 'next/types';
import type { Server } from 'socket.io';
import type { ClientEmitEvents } from './ClientEmitEvents';
import type { ServerEmitEvents } from './ServerEmitEvents';

export type SocketApiResponse = NextApiResponse & {
  socket?: { server: { io: Server<ClientEmitEvents, ServerEmitEvents> } };
};

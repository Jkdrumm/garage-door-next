import type { NextApiResponse } from 'next/types';
import type { Server } from 'socket.io';

export type SocketApiResponse = NextApiResponse & { socket?: { server: { io: Server } } };

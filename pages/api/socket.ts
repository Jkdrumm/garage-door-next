import type { NextApiHandler, NextApiRequest } from 'next';
import { Server, ServerOptions } from 'socket.io';
import type { ClientEmitEvents, ServerEmitEvents, ServerSocket, SocketApiResponse } from 'types';
import { WebSocketService } from 'services';
import { apiRequireLoggedIn } from 'auth';
import { getUserLevel, getSession, getUser } from 'auth/get';

/**
 * API endpoint to open a websocket.
 * Requires being logged in.
 * @param req {@link NextApiRequest}
 * @param res {@link NextApiResponse}
 */
async function socket(req: NextApiRequest, res: SocketApiResponse) {
  const { expires } = (await getSession({ req })) ?? { expires: '' };
  const { id } = await getUser(req);
  const userLevel = await getUserLevel(req);
  if (res.socket?.server.io) {
    // Just in case, we'll reset all of the listeners
    res.socket.server.io.sockets.removeAllListeners();
  } else {
    const io = new Server<ClientEmitEvents, ServerEmitEvents>(res.socket.server as any as ServerOptions);
    res.socket.server.io = io;
  }
  res.socket.server.io.on(
    'connection',
    async (socket: ServerSocket) => await WebSocketService.getInstance().addSocket(socket, id, userLevel, expires),
  );
  res.end();
}

export default apiRequireLoggedIn(socket as NextApiHandler);

export const config = {
  api: {
    externalResolver: true,
  },
};

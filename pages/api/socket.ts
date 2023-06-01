import type { NextApiHandler, NextApiRequest } from 'next';
import type { Socket, SocketApiResponse } from '../../utils/types';
import { Server, ServerOptions } from 'socket.io';
import { WebSocketService } from '../../utils/services';
import { apiRequireLoggedIn } from '../../utils/auth';
import { getAdminLevel, getSession, getUser } from '../../utils/auth/get';

/**
 * API endpoint to open a websocket.
 * Requires being logged in.
 * @param req {@link NextApiRequest}
 * @param res {@link NextApiResponse}
 */
async function socket(req: NextApiRequest, res: SocketApiResponse) {
  const { expires } = (await getSession({ req })) ?? { expires: '' };
  const { id } = await getUser(req);
  const adminLevel = await getAdminLevel(req);
  if (res.socket?.server.io) {
    // Just in case, we'll reset all of the listeners
    res.socket.server.io.sockets.removeAllListeners();
  } else {
    const io = new Server(res.socket.server as any as ServerOptions);
    res.socket.server.io = io;
  }
  res.socket.server.io.on('connection', (socket: Socket) =>
    WebSocketService.getInstance().addSocket(socket, id, adminLevel, expires)
  );
  res.end();
}

export default apiRequireLoggedIn(socket as NextApiHandler);

export const config = {
  api: {
    externalResolver: true
  }
};

import type { NextApiRequest } from 'next';
import { Server } from 'socket.io';
import { SocketApiResponse } from '../../utils/types';
import { WebSocketService } from '../../utils/services';
import { apiRequireLoggedIn } from '../../utils/auth';
import { getAdminLevel, getSession, getUser } from '../../utils/auth/get';

const socket = async (req: NextApiRequest, res: SocketApiResponse) => {
  const { expires } = (await getSession({ req })) ?? { expires: '' };
  const { id } = await getUser(req);
  const adminLevel = await getAdminLevel(req);
  if (res.socket?.server.io) {
    // Just in case, we'll reset all of the listeners
    res.socket.server.io.sockets.removeAllListeners();
  } else {
    const io = new Server(res.socket.server as any);
    res.socket.server.io = io;
  }
  res.socket.server.io.on('connection', socket =>
    WebSocketService.getInstance().addSocket(socket, id, adminLevel, expires)
  );
  res.end();
};

export default apiRequireLoggedIn(socket as any);

export const config = {
  api: {
    externalResolver: true
  }
};

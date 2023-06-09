import { Server as SocketIOServer } from 'socket.io';

/**
 * A data structure for a websocket server.
 */
export class Server extends SocketIOServer {
  public requestIndex: number | undefined;
  public expires: string | undefined;
}

import { Server as SocketIOServer } from 'socket.io';

export class Server extends SocketIOServer {
  public requestIndex: number | undefined;
  public expires: string | undefined;
}

import { UserLevel, GarageState, GarageLiveEvent } from 'enums';
import { Socket, User } from 'types';
import { GarageDoorService, UsersService } from 'services';
import { addEventListeners } from './websocket';

export type WebSocketConnection = { id: string; socket: Socket; expires: string };

export type WebSocketClients = { [key: string]: { connections: WebSocketConnection[]; userLevel: UserLevel } };

export class WebSocketService {
  private webSocketClients: WebSocketClients = {};

  private constructor() {}

  /**
   * Get the Singleton instance of this class
   * @returns The singleton instance
   */
  public static getInstance(): WebSocketService {
    if (!global.webSocketManagerInstance) global.webSocketManagerInstance = new WebSocketService();
    return global.webSocketManagerInstance;
  }

  /**
   * Add a new websocket connection to the list of clients to track.
   * @param socket The websocket to add
   * @param id The ID of the user
   * @param userLevel The user level of the user
   * @param expires The expiration of the websocket
   */
  public async addSocket(socket: Socket, id: string, userLevel: UserLevel, expires: string) {
    const webSocketClients = this.getWebsocketClients();
    const usersCurrentSockets = webSocketClients[id];
    const webSocketConnection = { id: socket.id, socket, expires };
    if (usersCurrentSockets === undefined) {
      webSocketClients[id] = {
        userLevel,
        connections: [webSocketConnection]
      };
    } else {
      usersCurrentSockets.connections.push(webSocketConnection);
    }

    await addEventListeners(socket, id);

    socket.on('disconnect', () => {
      const webSocketClients = this.getWebsocketClients();
      const userSockets = webSocketClients[id];
      const foundSocket = userSockets.connections.find(connection => connection.socket.id === socket.id);
      if (foundSocket === undefined) {
        console.error('Error (1) when disconnecting socket');
        return;
      }
      const socketId = userSockets.connections.indexOf(foundSocket);
      if (socketId < 0) {
        console.error('Error (2) when disconnecting socket');
        return;
      }
      const { connections } = userSockets;
      connections.splice(socketId, 1);
      if (connections.length === 0) delete webSocketClients[id];
    });

    this.onConnectMessage(socket, userLevel);
  }

  /**
   * Gets the web socket clients.
   * @returns The list of websockets
   */
  public getWebsocketClients(): WebSocketClients {
    return this.webSocketClients;
  }

  /**
   * Sends a message to all clients of the specified user level and above.
   */
  public emitMessage(type: GarageLiveEvent, userLevel: UserLevel, message?: any) {
    const connectionsToTimeout = [];
    const webSocketClients = this.getWebsocketClients();
    for (const [, singleUserConnections] of Object.entries(webSocketClients))
      if (singleUserConnections.userLevel >= userLevel)
        for (const [, socket] of Object.entries(singleUserConnections.connections))
          if (new Date(socket.expires) >= new Date()) socket.socket.emit(type, message);
          else connectionsToTimeout.push(socket);
    connectionsToTimeout.forEach(socket => {
      socket.socket.emit('SESSION_TIMEOUT');
      socket.socket.disconnect();
    });
  }

  /**
   * Notify the updated user of a user level change.
   * @param id The ID of the user
   * @param userLevel The user level
   */
  public notifyUserLevel(id: User['id'], userLevel: UserLevel) {
    const webSocketClients = this.getWebsocketClients();
    const userConnection = webSocketClients[id];
    if (userConnection !== undefined) {
      userConnection.userLevel = userLevel;
      const message: { userLevel: UserLevel; garageState?: GarageState; numNotifications?: number } = { userLevel };
      if (userLevel >= UserLevel.VIEWER) {
        const currentGarageState = GarageDoorService.getInstance().getDoorState();
        message.garageState = currentGarageState;
      }
      if (userLevel >= UserLevel.ADMIN) {
        const numNotifications = UsersService.getInstance().getNotificationCount(userLevel);
        message.numNotifications = numNotifications;
      }
      userConnection.connections.forEach(socket => socket.socket.emit('USER_LEVEL', message));
    }
  }

  /**
   * Force signout a user.
   * @param id The ID of the user
   */
  public signOutUser(id: User['id']) {
    const webSocketClients = this.getWebsocketClients();
    const userConnection = webSocketClients[id];
    if (userConnection !== undefined)
      userConnection.connections.forEach(socket => socket.socket.emit('SESSION_TIMEOUT'));
  }

  /**
   * Messages to send upon connecting to a new client.
   * @param socket The socket to send the messages to
   * @param userLevel The admin level of the user
   */
  private onConnectMessage(socket: Socket, userLevel: UserLevel) {
    const message: { userLevel: UserLevel; garageState?: GarageState; numNotifications?: number } = { userLevel };
    if (userLevel >= UserLevel.VIEWER) {
      const currentGarageState = GarageDoorService.getInstance().getDoorState();
      message.garageState = currentGarageState;
    }
    if (userLevel >= UserLevel.ADMIN) {
      const numNotifications = UsersService.getInstance().getNotificationCount(userLevel);
      message.numNotifications = numNotifications;
    }
    socket.emit('USER_LEVEL', message);
  }
}

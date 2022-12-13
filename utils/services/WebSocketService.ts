import { Payload } from '../classes';
import { AdminLevel, GarageAction, GarageEvent, GarageState } from '../enums';
import { Socket, User } from '../types';
import { GarageDoorService } from './GarageDoorService';

export type WebSocketConnection = { id: string; socket: Socket; expires: string };

export type WebSocketClients = { [key: string]: { connections: WebSocketConnection[]; adminLevel: AdminLevel } };

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
   * @param adminLevel The admin level of the user
   * @param expires The expiration of the websocket
   */
  public addSocket(socket: Socket, id: string, adminLevel: AdminLevel, expires: string) {
    const webSocketClients = this.getWebsocketClients();
    const usersCurrentSockets = webSocketClients[id];
    const webSocketConnection = { id: socket.id, socket, expires };
    if (usersCurrentSockets === undefined) {
      webSocketClients[id] = {
        adminLevel,
        connections: [webSocketConnection]
      };
    } else {
      usersCurrentSockets.connections.push(webSocketConnection);
    }

    socket.on('message', (message: GarageAction) => {
      switch (message) {
        case GarageAction.PRESS:
          receivePress();
          break;
        default:
          console.error(`Unexpected Garage Action: ${message}`);
      }
    });

    const receivePress = () => {
      const webSocketClients = this.getWebsocketClients();
      const userSockets = webSocketClients[id];
      const acknowledgement = new Payload();
      acknowledgement.add({ event: GarageEvent.ACKNOWLEDGEMNET });
      socket.emit('message', acknowledgement.getPayload());
      if (userSockets.adminLevel >= AdminLevel.USER) GarageDoorService.getInstance().pressButton(id);
    };

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

    this.onConnectMessage(socket, adminLevel);
  }

  /**
   * Gets the web socket clients.
   * @returns The list of websockets
   */
  public getWebsocketClients(): WebSocketClients {
    return this.webSocketClients;
  }

  /**
   * Notify all clients of a door state change.
   * @param garageState The state of the door
   */
  public notifyDoorState(garageState: GarageState) {
    const connectionsToTimeout = [];
    const webSocketClients = this.getWebsocketClients();
    for (const [, singleUserConnections] of Object.entries(webSocketClients))
      if (singleUserConnections.adminLevel >= AdminLevel.VIEWER)
        for (const [, socket] of Object.entries(singleUserConnections.connections))
          if (new Date(socket.expires) >= new Date()) {
            const message = new Payload();
            message.add({ event: GarageEvent.STATE, message: garageState });
            socket.socket.emit('message', message.getPayload());
          } else connectionsToTimeout.push(socket);
    connectionsToTimeout.forEach(socket => {
      const message = new Payload();
      message.add({
        event: GarageEvent.SESSION_TIMEOUT
      });
      socket.socket.emit('message', message.getPayload());
      socket.socket.disconnect();
    });
  }

  /**
   * Notify the updated user of an admin level change.
   * @param id The ID of the user
   * @param adminLevel The admin level
   */
  public notifyAdminLevel(id: User['id'], adminLevel: AdminLevel) {
    const webSocketClients = this.getWebsocketClients();
    const userConnection = webSocketClients[id];
    if (userConnection !== undefined) {
      userConnection.adminLevel = adminLevel;
      const message = new Payload();
      const currentGarageState = GarageDoorService.getInstance().getDoorState();
      message.add({ event: GarageEvent.ADMIN, message: adminLevel });
      if (adminLevel >= AdminLevel.VIEWER)
        message.add({ event: GarageEvent.STATE, message: currentGarageState as GarageState });
      userConnection.connections.forEach(socket => socket.socket.emit('message', message.getPayload()));
    }
  }

  /**
   * Force signout a user.
   * @param id The ID of the user
   */
  public signOutUser(id: User['id']) {
    const webSocketClients = this.getWebsocketClients();
    const userConnection = webSocketClients[id];
    if (userConnection !== undefined) {
      const message = new Payload();
      message.add({ event: GarageEvent.SESSION_TIMEOUT });
      userConnection.connections.forEach(socket => socket.socket.emit('message', message.getPayload()));
    }
  }

  /**
   * Messages to send upon connecting to a new client.
   * @param socket The socket to send the messages to
   * @param adminLevel The admin level of the user
   */
  private onConnectMessage(socket: Socket, adminLevel: AdminLevel) {
    const message = new Payload();
    if (adminLevel > AdminLevel.ACCOUNT)
      message.add({ event: GarageEvent.STATE, message: GarageDoorService.getInstance().getDoorState() as GarageState });
    message.add({ event: GarageEvent.ACKNOWLEDGEMNET });
    message.add({ event: GarageEvent.ADMIN, message: adminLevel });
    socket.emit('message', message.getPayload());
  }
}

import { MongoClient } from 'mongodb';
import type { User } from 'types';
import { UserLevel } from 'enums';
import { WebSocketService } from 'services';

export interface UsersCache {
  [id: string]: User;
}

export class UsersService {
  private usersCache: UsersCache;

  private constructor() {
    this.usersCache = {};
    this.loadUsers().catch(console.error);
  }

  /**
   * Get the Singleton instance of this class
   * @returns The singleton instance
   */
  public static getInstance(): UsersService {
    if (!global.usersServiceInstance) global.usersServiceInstance = new UsersService();
    return global.usersServiceInstance;
  }

  /**
   * Loads all users from the DB.
   */
  private async loadUsers() {
    const client = await MongoClient.connect(`mongodb://${process.env.MONGODB_URI}`);
    const db = client.db();
    db.collection('users')
      .find()
      .toArray((error, result) => {
        client.close().catch(console.error);
        if (error) throw error;
        else {
          const resultsPasswordRemoved = result?.map(user => ({
            id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            userLevel: user.adminLevel,
          }));
          if (resultsPasswordRemoved === undefined) throw new Error('Users is undefined');
          else {
            this.setUsers(resultsPasswordRemoved);
          }
        }
      });
  }

  /**
   * Gets a specific user from the DB.
   * @param id The ID of the user
   * @returns The user object
   * @throws Error if the ID is falsey or if the user is not found
   */
  public getUser(id?: string) {
    // Allow undefined to reduce repetitiveness in error handling.
    if (!id) throw new Error('Cannot get user of id undefined');
    const cacheEntry = this.usersCache[id];
    if (cacheEntry !== undefined) return cacheEntry;
    throw new Error('User not found');
  }

  /**
   * Determine if the user is currently in cache.
   * @param id The ID of the user
   * @returns A boolean for if the user is in cache
   */
  public isUserInCache(id: string) {
    try {
      this.getUser(id);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Gets the admin level of a user.
   * @param id The ID of the user
   * @returns The admin level of the user
   */
  public getUserLevel(id?: string) {
    return this.getUser(id).userLevel;
  }

  /**
   * Updates the user level of a user.
   * @param id The ID of the user
   * @param userLevel The user level to update the user to
   */
  public updateUserLevel(id: string, userLevel: UserLevel) {
    const cacheEntry = this.usersCache[id];
    if (cacheEntry !== undefined) {
      cacheEntry.userLevel = userLevel;
      const websocketService = WebSocketService.getInstance();
      websocketService.notifyUserLevel(id, userLevel);
      websocketService.emitMessage('USER_UPDATED', { id, userLevel });
    }
  }

  /**
   * Update fields on a user.
   * @param id The ID of the user
   * @param fields The values to update
   */
  public updateFields(id: string, { firstName, lastName }: Pick<User, 'firstName' | 'lastName'>) {
    const cacheEntry = this.usersCache[id];
    if (cacheEntry !== undefined) {
      if (firstName) cacheEntry.firstName = firstName;
      if (lastName) cacheEntry.lastName = lastName;
      WebSocketService.getInstance().emitMessage('USER_UPDATED', { id, firstName, lastName });
    }
  }

  /**
   * Remove a user from the system
   * @param id The ID of the user
   * @returns A boolean for if the user was removed
   */
  public removeUser(id: string): boolean {
    const cacheEntry = this.usersCache[id];
    if (!cacheEntry) return false;
    delete this.usersCache[id];
    const webSocketService = WebSocketService.getInstance();
    webSocketService.signOutUser(id);
    webSocketService.emitMessage('USER_DELETED', id);
    return true;
  }

  /**
   * Sets the cached users.
   * @param users The users to cache
   */
  private setUsers(users: User[]) {
    const newUsersCache: UsersCache = {};
    users.forEach(user => (newUsersCache[user.id] = user));
    this.usersCache = newUsersCache;
  }

  /**
   * Gets all users as an array.
   * @returns All users
   */
  public getUsers() {
    return Object.values(this.usersCache);
  }

  /**
   * Adds a user to the system.
   * @param user The user object to add
   */
  public addUser(user: User) {
    this.usersCache[user.id] = user;
    WebSocketService.getInstance().emitMessage('NEW_USER', user);
  }

  /**
   * Get the number of notifications to display to a user.
   * @param userLevel The admin level of the user
   * @returns The number of notifications
   */
  public getNotificationCount(userLevel: UserLevel) {
    if (userLevel === UserLevel.ACCOUNT) return 1;
    if (userLevel < UserLevel.ADMIN) return 0;
    // Admin accounts only
    const numAccountLevelUsers = this.getUsers().filter(user => user.userLevel === UserLevel.ACCOUNT).length;
    return numAccountLevelUsers;
  }
}

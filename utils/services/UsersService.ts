import type { User } from '../types';
import { AdminLevel } from '../enums';
import { MongoClient } from 'mongodb';
import { WebSocketService } from './WebSocketService';

export interface UsersCache {
  [id: string]: User;
}

export class UsersService {
  private usersCache: UsersCache;

  private constructor() {
    this.usersCache = {};
    this.loadUsers();
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
        client.close();
        if (error) throw error;
        else {
          const resultsPasswordRemoved = result?.map(user => ({
            id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            adminLevel: user.adminLevel
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
  public getAdminLevel(id?: string) {
    return this.getUser(id).adminLevel;
  }

  /**
   * Updates the admin level of a user.
   * @param id The ID of the user
   * @param adminLevel The admin level to update the user to
   */
  public updateAdminLevel(id: string, adminLevel: AdminLevel) {
    const cacheEntry = this.usersCache[id];
    if (cacheEntry !== undefined) {
      cacheEntry.adminLevel = adminLevel;
      WebSocketService.getInstance().notifyAdminLevel(id, adminLevel);
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
    }
  }

  /**
   * Remove a user from the system
   * @param id The ID of the user
   * @throws When user is not
   */
  public removeUser(id: string) {
    const cacheEntry = this.usersCache[id];
    if (cacheEntry !== undefined) {
      delete this.usersCache[id];
      WebSocketService.getInstance().signOutUser(id);
    } else throw new Error('User not in cache');
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
  }

  /**
   * Get the number of notifications to display to a user.
   * @param adminLevel The admin level of the user
   * @returns The number of notifications
   */
  public getNotificationCount(adminLevel: AdminLevel) {
    if (adminLevel === AdminLevel.ACCOUNT) return 1;
    if (adminLevel < AdminLevel.ADMIN) return 0;
    // Admin accounts only
    const numAccountLevelUsers = this.getUsers().filter(user => user.adminLevel === AdminLevel.ACCOUNT).length;
    return numAccountLevelUsers;
  }
}

// Load the service immediately
UsersService.getInstance();

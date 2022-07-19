import type { User } from '../types';
import { AdminLevel } from '../enums';
import { MongoClient } from 'mongodb';
import { WebSocketService } from './WebSocketService';

export interface UsersCache {
  [id: string]: User;
}

setTimeout(() => {}, 1000);

class UsersService {
  private static instance: UsersService;
  private usersCache: UsersCache;

  private constructor() {
    this.usersCache = {};
    this.loadUsers();
  }

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

  public static getInstance(): UsersService {
    console.log('GETTING INSTANCE');
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (process.env.NODE_ENV === 'development') {
      if (!global.usersServiceInstance) global.usersServiceInstance = new UsersService();
      return global.usersServiceInstance;
    }

    if (!this.instance) this.instance = new UsersService();
    return this.instance;
  }

  public getUser(id?: string) {
    if (!id) throw new Error('Cannot get user of id undefined');
    const cacheEntry = this.usersCache[id];
    if (cacheEntry !== undefined) return cacheEntry;
    throw new Error('User not found');
  }

  public isUserInCache(id: string) {
    try {
      this.getUser(id);
      return true;
    } catch (e) {
      return false;
    }
  }

  public getAdminLevel(id?: string) {
    return this.getUser(id).adminLevel;
  }

  public setAdminLevel(id: string, adminLevel: AdminLevel) {
    const cacheEntry = this.usersCache[id];
    cacheEntry.adminLevel = adminLevel;
  }

  public updateAdminLevel(id: string, adminLevel: AdminLevel) {
    const cacheEntry = this.usersCache[id];
    if (cacheEntry !== undefined) {
      cacheEntry.adminLevel = adminLevel;
      WebSocketService.getInstance().updateUserLevel(id, adminLevel);
    }
  }

  public updateFields(
    id: string,
    { firstName, lastName }: { firstName: User['firstName']; lastName: User['lastName'] }
  ) {
    const cacheEntry = this.usersCache[id];
    if (cacheEntry !== undefined) {
      if (firstName) cacheEntry.firstName = firstName;
      if (lastName) cacheEntry.lastName = lastName;
    }
  }

  public removeUser(id: string) {
    const cacheEntry = this.usersCache[id];
    if (cacheEntry !== undefined) {
      delete this.usersCache[id];
      WebSocketService.getInstance().signOutUser(id);
    } else throw new Error('User not in cache');
  }

  public setUsers(users: User[]) {
    const newUsersCache: UsersCache = {};
    users.forEach(user => (newUsersCache[user.id] = user));
    this.usersCache = newUsersCache;
  }

  public getUsers() {
    return Object.values(this.usersCache);
  }

  public addUser(user: User) {
    this.usersCache[user.id] = user;
  }

  public getNotificationCount(adminLevel: AdminLevel) {
    if (adminLevel === AdminLevel.ACCOUNT) return 1;
    if (adminLevel < AdminLevel.ADMIN) return 0;
    // Admin accounts only
    const numAccountLevelUsers = service.getUsers().filter(user => user.adminLevel === AdminLevel.ACCOUNT).length;
    return numAccountLevelUsers;
  }
}

// Load the service immediately
// UsersService.getInstance();

const service = UsersService.getInstance();

export { service };

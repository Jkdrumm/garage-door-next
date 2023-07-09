import { Socket } from 'socket.io';
import { addEventListener } from './utils';
import { ObjectId } from 'mongodb';
import { DatabaseService, UsersService } from 'services';

export function deleteUser(socket: Socket, id: string) {
  addEventListener(socket, id, 'DELETE_USER', async ({ id }: { id: string }) => {
    const client = DatabaseService.getInstance().getClient();
    const updateResult = await client.collection('users').deleteOne({ _id: new ObjectId(id) });
    if (!updateResult.acknowledged || !UsersService.getInstance().removeUser(id))
      throw new Error('Failed to delete user.');
  });
}

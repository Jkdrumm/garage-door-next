import { Socket } from 'socket.io';
import { addEventListener } from './utils';
import { MongoClient, ObjectId } from 'mongodb';
import { UsersService } from 'services';

export function deleteUser(socket: Socket, id: string) {
  addEventListener(socket, id, 'DELETE_USER', async ({ id }: { id: string }) => {
    const client = await MongoClient.connect(`mongodb://${process.env.MONGODB_URI}`);
    const db = client.db();
    const updateResult = await db.collection('users').deleteOne({ _id: new ObjectId(id) });
    await client.close();
    if (!updateResult.acknowledged || !UsersService.getInstance().removeUser(id))
      throw new Error('Failed to delete user.');
  });
}

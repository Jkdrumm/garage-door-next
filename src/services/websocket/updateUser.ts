import { Socket } from 'socket.io';
import { MongoClient, ObjectId } from 'mongodb';
import { addEventListener } from './utils';
import { UsersService } from 'services';
import { UserLevel } from 'enums';

export function updateUser(socket: Socket, id: string) {
  addEventListener(
    socket,
    id,
    'UPDATE_USER',
    async ({ id: updateUserId, userLevel }: { id: string; userLevel: UserLevel }) => {
      if (updateUserId === id) throw new Error('Cannot update user level of own user.');
      const updateParameters = { adminLevel: userLevel };
      const client = await MongoClient.connect(`mongodb://${process.env.MONGODB_URI}`);
      const db = client.db();
      const updateResult = await db
        .collection('users')
        .updateOne({ _id: new ObjectId(updateUserId) }, { $set: updateParameters });
      if (updateResult.acknowledged) UsersService.getInstance().updateUserLevel(updateUserId, userLevel);
      await client.close();
    },
  );
}

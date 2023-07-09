import { Socket } from 'socket.io';
import { ObjectId } from 'mongodb';
import { addEventListener } from './utils';
import { DatabaseService, UsersService } from 'services';
import { UserLevel } from 'enums';

export function updateUser(socket: Socket, id: string) {
  addEventListener(
    socket,
    id,
    'UPDATE_USER',
    async ({ id: updateUserId, userLevel }: { id: string; userLevel: UserLevel }) => {
      if (updateUserId === id) throw new Error('Cannot update user level of own user.');
      const updateParameters = { adminLevel: userLevel };
      const client = DatabaseService.getInstance().getClient();
      const updateResult = await client
        .collection('users')
        .updateOne({ _id: new ObjectId(updateUserId) }, { $set: updateParameters });
      if (updateResult.acknowledged) UsersService.getInstance().updateUserLevel(updateUserId, userLevel);
    },
  );
}

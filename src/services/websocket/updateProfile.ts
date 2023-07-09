import { Socket } from 'socket.io';
import { ObjectId } from 'mongodb';
import { addEventListener } from './utils';
import { DatabaseService, UsersService } from 'services';
import { hash } from 'bcryptjs';
import { UserLevel } from 'enums';

export function updateProfile(socket: Socket, id: string) {
  addEventListener(
    socket,
    id,
    'UPDATE_PROFILE',
    async ({ firstName, lastName, password }: { firstName: string; lastName: string; password: string }) => {
      const user = UsersService.getInstance().getUser(id);
      const hasFirstName = firstName !== undefined;
      const hasLastName = lastName !== undefined;
      const hasPassword = password !== undefined;
      const updateParameters: any = {};
      if (hasFirstName) updateParameters.firstName = firstName;
      if (hasLastName) updateParameters.lastName = lastName;
      if (hasPassword) updateParameters.password = await hash(password, 12);
      const client = DatabaseService.getInstance().getClient();
      const updateResult = await client
        .collection('users')
        .updateOne({ _id: new ObjectId(user.id) }, { $set: updateParameters });
      if (updateResult.acknowledged) {
        delete updateParameters.password;
        if (hasFirstName || hasLastName) UsersService.getInstance().updateFields(user.id, updateParameters);
      } else throw new Error('Failed to update profile.');
    },
    { userLevel: UserLevel.ACCOUNT },
  );
}

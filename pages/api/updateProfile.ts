import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';
import { requirePost } from '../../utils/auth';
import { UsersService } from '../../utils/services';
import { getUserFromCache } from '../../utils/auth/get';
import { hash } from 'bcryptjs';

const updateProfile = async (req: NextApiRequest, res: NextApiResponse) => {
  const { firstName, lastName, password } = req.body;
  const user = await getUserFromCache(req);
  const hasFirstName = firstName !== undefined;
  const hasLastName = lastName !== undefined;
  const hasPassword = password !== undefined;
  const updateParameters: any = {};
  if (hasFirstName) updateParameters.firstName = firstName;
  if (hasLastName) updateParameters.lastName = lastName;
  if (hasPassword) updateParameters.password = await hash(password, 12);
  const client = await MongoClient.connect(`${process.env.MONGODB_URI}`);
  const db = client.db();
  const updateResult = await db
    .collection('users')
    .updateOne({ _id: new ObjectId(user.id) }, { $set: updateParameters });
  if (updateResult.acknowledged) {
    delete updateParameters.password;
    if (hasFirstName || hasLastName) UsersService.getInstance().updateFields(user.id, updateParameters);
    res.status(200).end();
  } else res.status(400).end();
  client.close();
};

export default requirePost(updateProfile);

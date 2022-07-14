import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';
import { apiRequireAdmin, requirePost } from '../../utils/auth';
import { UsersService } from '../../utils/services';

const deleteUser = async (req: NextApiRequest, res: NextApiResponse) => {
  const client = await MongoClient.connect(`${process.env.MONGODB_URI}`);
  const db = client.db();
  const { id } = req.body;
  const updateResult = await db.collection('users').deleteOne({ _id: new ObjectId(id) });
  if (updateResult.acknowledged) {
    UsersService.getInstance().removeUser(id);
    res.status(200).end();
  } else res.status(400).end();
  client.close();
};

export default requirePost(apiRequireAdmin(deleteUser));

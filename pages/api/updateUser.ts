import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';
import { apiRequireAdmin, requirePost } from '../../utils/auth';
import { UsersService } from '../../utils/services';
import { getUserFromCache } from '../../utils/auth/get';

const updateUser = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id, adminLevel } = req.body;
  const user = await getUserFromCache(req);
  if (user.id === id) res.status(400).json('Cannot update admin level of own user.');
  const updateParameters = {
    adminLevel
  };
  const client = await MongoClient.connect(`mongodb://${process.env.MONGODB_URI}`);
  const db = client.db();
  const updateResult = await db.collection('users').updateOne({ _id: new ObjectId(id) }, { $set: updateParameters });
  if (updateResult.acknowledged) {
    UsersService.getInstance().updateAdminLevel(id, adminLevel);
    res.status(200).end();
  } else res.status(400).end();
  client.close();
};

export default requirePost(apiRequireAdmin(updateUser));

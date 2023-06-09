import type { NextApiRequest, NextApiResponse } from 'next/types';
import { MongoClient } from 'mongodb';
import { hash } from 'bcryptjs';
import { validateName, validatePassword, validateUsername } from 'validations';
import { UserLevel } from 'enums';
import { UsersService } from 'services';
import { requirePost } from 'auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { firstName, lastName, username, password } = req.body;
  // Validate all fields
  if (validateName(firstName) || validateName(lastName) || validateUsername(username) || validatePassword(password))
    return res.status(422).json({ message: 'Invalid Data' });

  const client = await MongoClient.connect(`mongodb://${process.env.MONGODB_URI}`);
  const db = client.db();
  const checkExistingUser = await db.collection('users').findOne({ username });
  // Send error response if duplicate user is found
  if (checkExistingUser) {
    res.status(422).json({ message: 'Username taken' });
    await client.close();
    return;
  }
  // Default permissions are set to the bare minimum upon account creation.
  let adminLevel = UserLevel.ACCOUNT;
  // Check if device setup has been completed.
  const settings = await db.collection('settings').findOne();
  if (!settings?.setupComplete) {
    // If setup has not completed, make the first user the admin.
    adminLevel = UserLevel.ADMIN;
    // Save setup completed.
    await db.collection('settings').updateOne({}, { $set: { setupComplete: true } }, { upsert: true });
  }
  const status = await db.collection('users').insertOne({
    firstName,
    lastName,
    username,
    password: await hash(password, 12),
    adminLevel
  });
  UsersService.getInstance().addUser({
    id: status.insertedId.toString(),
    firstName,
    lastName,
    username,
    userLevel: adminLevel
  });
  res.status(201).json({ message: 'User created', ...status });
  await client.close();
}

export default requirePost(handler);

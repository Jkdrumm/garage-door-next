import type { NextApiRequest, NextApiResponse } from 'next';
import { apiRequireAdmin } from '../../utils/auth';
import { getUsers } from '../../utils/auth/get';

const users = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const users = getUsers();
    res.status(200).json(users);
  } catch (e) {
    res.status(400).end();
  }
};

export default apiRequireAdmin(users);

export const config = {
  api: {
    externalResolver: true
  }
};

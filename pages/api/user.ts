import type { NextApiRequest, NextApiResponse } from 'next';
import { apiRequireLoggedIn } from '../../utils/auth';
import { getUserFromCache } from '../../utils/auth/get';

const user = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const user = await getUserFromCache(req);
    res.status(200).json(user);
  } catch (e) {
    res.status(400).end();
  }
};

export default apiRequireLoggedIn(user);

export const config = {
  api: {
    externalResolver: true
  }
};

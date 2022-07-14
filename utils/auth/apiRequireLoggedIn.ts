import type { NextApiRequest, NextApiResponse } from 'next';
import { getUser } from './get';

export const apiRequireLoggedIn =
  (handler: (req: NextApiRequest, res: NextApiResponse) => void | Promise<void>) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await getUser(req);
      handler(req, res);
    } catch (e) {
      res.status(401).end();
    }
  };

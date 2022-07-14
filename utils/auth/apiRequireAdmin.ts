import type { NextApiRequest, NextApiResponse } from 'next';
import { AdminLevel } from '../enums';
import { getAdminLevel } from './get/getAdminLevel';

export const apiRequireAdmin =
  (handler: (req: NextApiRequest, res: NextApiResponse) => void | Promise<void>) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const adminLevel = await getAdminLevel(req);
      if (adminLevel < AdminLevel.ADMIN) throw new Error('Not an admin');
      handler(req, res);
    } catch (e) {
      res.status(401).end();
    }
  };

import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { AdminLevel } from '../enums';
import { getAdminLevel } from './get/getAdminLevel';

/**
 * Function wrapper to require admin privileges for API calls.
 * @param handler The API handler to wrap
 * @returns A {@link NextApiHandler}
 */
export function apiRequireAdmin(handler: NextApiHandler) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    try {
      const adminLevel = await getAdminLevel(req);
      if (adminLevel < AdminLevel.ADMIN) throw new Error('Not an admin');
      handler(req, res);
    } catch (e) {
      res.status(401).end();
    }
  };
}

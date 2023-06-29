import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { UserLevel } from 'enums';
import { getUserLevel } from 'auth/get';

/**
 * Function wrapper to require admin privileges for API calls.
 * @param handler The API handler to wrap
 * @returns A {@link NextApiHandler}
 */
export function apiRequireAdmin(handler: NextApiHandler) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    try {
      const userLevel = await getUserLevel(req);
      if (userLevel < UserLevel.ADMIN) throw new Error('Not an admin');
      handler(req, res);
    } catch (e) {
      res.status(401).end();
    }
  };
}

import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { getUser } from './get';

/**
 * Function wrapper to require being logged in for API calls.
 * @param handler The API handler to wrap
 * @returns A {@link NextApiHandler}
 */
export function apiRequireLoggedIn(handler: NextApiHandler) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    try {
      await getUser(req);
      handler(req, res);
    } catch (e) {
      res.status(401).end();
    }
  };
}

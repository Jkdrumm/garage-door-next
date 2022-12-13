import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

/**
 * Function wrapper to require post methods for API calls.
 * @param handler The API handler to wrap
 * @returns A {@link NextApiHandler}
 */
export function requirePost(handler: NextApiHandler) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') handler(req, res);
    else res.status(405).end();
  };
}

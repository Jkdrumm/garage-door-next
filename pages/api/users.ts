import type { NextApiRequest, NextApiResponse } from 'next';
import { apiRequireAdmin } from '../../utils/auth';
import { getUsers } from '../../utils/auth/get';

/**
 * API endpoint to get all users.
 * Requires admin privileges.
 * @param _req {@link NextApiRequest}
 * @param res {@link NextApiResponse}
 */
async function users(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const users = getUsers();
    res.status(200).json(users);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
}

export default apiRequireAdmin(users);

export const config = {
  api: {
    externalResolver: true
  }
};

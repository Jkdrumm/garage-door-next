import type { NextApiRequest, NextApiResponse } from 'next';
import { apiRequireLoggedIn } from '../../utils/auth';
import { getAdminLevel } from '../../utils/auth/get';

/**
 * API endpoint to get the admin level of the user.
 * Requires being logged in.
 * @param req {@link NextApiRequest}
 * @param res {@link NextApiResponse}
 */
async function adminLevel(req: NextApiRequest, res: NextApiResponse) {
  try {
    const adminLevel = await getAdminLevel(req);
    res.status(200).json(adminLevel);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
}

export default apiRequireLoggedIn(adminLevel);

export const config = {
  api: {
    externalResolver: true
  }
};

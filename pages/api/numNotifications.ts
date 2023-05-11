import type { NextApiRequest, NextApiResponse } from 'next';
import { apiRequireLoggedIn } from '../../utils/auth';
import { getNumNotifications } from '../../utils/auth/get';

/**
 * API endpoint to get the number of notifications to show.
 * Requires being logged in.
 * @param req {@link NextApiRequest}
 * @param res {@link NextApiResponse}
 */
async function numNotifications(req: NextApiRequest, res: NextApiResponse) {
  try {
    const numNotifications = await getNumNotifications(req);
    res.status(200).json(numNotifications);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
}

export default apiRequireLoggedIn(numNotifications);

export const config = {
  api: {
    externalResolver: true
  }
};

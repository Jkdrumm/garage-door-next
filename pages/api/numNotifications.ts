import type { NextApiRequest, NextApiResponse } from 'next';
import { apiRequireLoggedIn } from '../../utils/auth';
import { getNumNotifications } from '../../utils/auth/get';

const numNotifications = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const numNotifications = await getNumNotifications(req);
    res.status(200).json(numNotifications);
  } catch (e) {
    res.status(400).end();
  }
};

export default apiRequireLoggedIn(numNotifications);

export const config = {
  api: {
    externalResolver: true
  }
};

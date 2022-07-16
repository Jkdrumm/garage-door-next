import type { NextApiRequest, NextApiResponse } from 'next';
import { apiRequireLoggedIn } from '../../utils/auth';
import { getAdminLevel } from '../../utils/auth/get';

const adminLevel = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const adminLevel = await getAdminLevel(req);
    res.status(200).json(adminLevel);
  } catch (e) {
    res.status(400).end();
  }
};

export default apiRequireLoggedIn(adminLevel);

export const config = {
  api: {
    externalResolver: true
  }
};

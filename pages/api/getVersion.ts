import type { NextApiRequest, NextApiResponse } from 'next';
import { apiRequireAdmin } from '../../utils/auth';
import { VersionService } from '../../utils/services';

/**
 * API endpoint to get DNS configurations.
 * Requires admin privileges.
 * @param _req {@link NextApiRequest}
 * @param res {@link NextApiResponse}
 */
async function getVersion(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const version = await VersionService.getInstance().getVersion();
    res.status(200).json(version);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
}

export default apiRequireAdmin(getVersion);

export const config = {
  api: {
    externalResolver: true
  }
};

import type { NextApiRequest, NextApiResponse } from 'next';
import { apiRequireAdmin, requirePost } from '../../utils/auth';
import { DnsService } from '../../utils/services';

/**
 * API endpoint to set DNS configurations.
 * Requires admin privileges.
 * @param req {@link NextApiRequest}
 * @param res {@link NextApiResponse}
 */
async function configureDNS(req: NextApiRequest, res: NextApiResponse) {
  const { key, secret, hostname } = req.body;
  try {
    await DnsService.getInstance().newLogin(key, secret, hostname);
    res.status(200).end();
  } catch (error: any) {
    console.error(error.error.message);
    res.status(400).json(error.error.message);
  }
}

export default requirePost(apiRequireAdmin(configureDNS));

import type { NextApiRequest, NextApiResponse } from 'next';
import { apiRequireAdmin } from '../../utils/auth';
import { DnsService } from '../../utils/services';

/**
 * API endpoint to get new certificates from greenlock.
 * Requires admin privileges.
 * @param _req {@link NextApiRequest}
 * @param res {@link NextApiResponse}
 */
async function getCertificate(_req: NextApiRequest, res: NextApiResponse) {
  try {
    await DnsService.getInstance().getNewCertificates();
    res.status(200).end();
  } catch (error) {
    res.status(400).end();
  }
}

export default apiRequireAdmin(getCertificate);

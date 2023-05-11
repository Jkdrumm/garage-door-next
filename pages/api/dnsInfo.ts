import type { NextApiRequest, NextApiResponse } from 'next';
import { apiRequireAdmin } from '../../utils/auth';
import { DnsService } from '../../utils/services';

/**
 * API endpoint to get DNS configurations.
 * Requires admin privileges.
 * @param _req {@link NextApiRequest}
 * @param res {@link NextApiResponse}
 */
async function dnsInfo(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const dnsService = DnsService.getInstance();
    const hostname = dnsService.getHostname();
    const isLoggedIn = dnsService.getIsLoggedIn();
    const isRunningHttps = dnsService.getIsRunningHttps();
    res.status(200).json({ hostname, isLoggedIn, isRunningHttps });
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
}

export default apiRequireAdmin(dnsInfo);

export const config = {
  api: {
    externalResolver: true
  }
};

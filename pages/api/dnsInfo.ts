import type { NextApiRequest, NextApiResponse } from 'next';
import { apiRequireAdmin } from '../../utils/auth';
import { DnsService } from '../../utils/services';

const dnsInfo = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const dnsService = DnsService.getInstance();
    const hostname = dnsService.getHostname();
    const isLoggedIn = dnsService.getIsLoggedIn();
    const isRunningHttps = dnsService.getIsRunningHttps();
    res.status(200).json({ hostname, isLoggedIn, isRunningHttps });
  } catch (e) {
    res.status(400).end();
  }
};

export default apiRequireAdmin(dnsInfo);

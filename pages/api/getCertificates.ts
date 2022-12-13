import type { NextApiRequest, NextApiResponse } from 'next';
import { apiRequireAdmin } from '../../utils/auth';
import pkg from '../../package.json';
import Greenlock from 'greenlock';
import { DnsService, LogService } from '../../utils/services';
import { LogEvent } from '../../utils/types/LogEntry';

/**
 * API endpoint to get new certificates from greenlock.
 * Requires admin privileges.
 * @param _req {@link NextApiRequest}
 * @param res {@link NextApiResponse}
 */
async function getCertificate(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const dnsService = DnsService.getInstance();
    if (!dnsService.getIsLoggedIn()) {
      res.status(200).json({ message: 'DNS Login must be configured first' });
      return;
    }
    const key = dnsService.getKey();
    const secret = dnsService.getSecret();
    const hostname = dnsService.getHostname();

    const greenlock = Greenlock.create({
      packageRoot: process.cwd(),
      configDir: './greenlock.d',
      packageAgent: pkg.name + '/' + pkg.version,
      maintainerEmail: pkg.author.email,
      subscriberEmail: pkg.author.email,
      staging: process.env.NODE_ENV !== 'production',
      notify: (event: string, details: any) => {
        if ('error' === event) {
          // `details` is an error object in this case
          console.error(details);
        }
      }
    });

    await greenlock.add({
      subject: hostname,
      altnames: [hostname],
      agreeToTerms: true,
      subscriberEmail: pkg.author.email,
      staging: true,
      store: {
        module: 'greenlock-store-fs',
        basePath: process.cwd() + '/.config/greenlock'
      },
      challenges: {
        'dns-01': {
          module: 'acme-dns-01-godaddy',
          key,
          secret
        }
      }
    });

    try {
      const { pems } = await greenlock.get({ servername: hostname });
      if (pems && pems.privkey && pems.cert && pems.chain) {
        global.startHttps();
        res.status(200).end();
        LogService.getInstance().addEntry(LogEvent.CERTIFICATES, {});
      } else res.status(400).end();
    } catch (error: any) {
      console.error('Big bad error:', error.code);
      console.error(error);
      throw error;
    }
  } catch (error) {
    console.error(error);
    res.status(400).end();
  }
}

export default apiRequireAdmin(getCertificate);

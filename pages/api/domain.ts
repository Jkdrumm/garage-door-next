import type { NextApiRequest, NextApiResponse } from 'next';
import { DnsService, SettingsService } from 'services';

/**
 * API endpoint to open a websocket.
 * Requires being logged in.
 * @param req {@link NextApiRequest}
 * @param res {@link NextApiResponse}
 */
async function domain(_req: NextApiRequest, res: NextApiResponse) {
  const domain = DnsService.getInstance().getHostname();
  const deviceName = SettingsService.getInstance().getDeviceName();
  res.json({ domain, deviceName });
}

export default domain;

export const config = {
  api: {
    externalResolver: true,
  },
};

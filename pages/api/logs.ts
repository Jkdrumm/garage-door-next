import type { NextApiRequest, NextApiResponse } from 'next';
import { apiRequireAdmin, requirePost } from '../../utils/auth';
import { LogService } from '../../utils/services';
import { LogLength } from '../../utils/types/LogEntry';

/**
 * API endpoint to get server logs.
 * Requires admin privileges.
 * @param req {@link NextApiRequest}
 * @param res {@link NextApiResponse}
 */
async function logs(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { date, length } = req.body as { date: string; length: LogLength };
    const logs = await LogService.getInstance().getLogs(date, length);
    res.status(200).json(logs);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
}

export default requirePost(apiRequireAdmin(logs));

export const config = {
  api: {
    externalResolver: true
  }
};

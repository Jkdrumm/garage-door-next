import type { NextApiRequest, NextApiResponse } from 'next';
import { apiRequireAdmin, requirePost } from '../../utils/auth';
import { LogService } from '../../utils/services/LogService';
import { LogLength } from '../../utils/types/LogEntry';

const logs = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { date, length } = req.body as { date: string; length: LogLength };
    const logs = await LogService.getInstance().getLogs(date, length);
    res.status(200).json(logs);
  } catch (e) {
    res.status(400).end();
  }
};

export default requirePost(apiRequireAdmin(logs));

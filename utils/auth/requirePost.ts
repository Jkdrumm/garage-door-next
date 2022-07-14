import type { NextApiRequest, NextApiResponse } from 'next';

export const requirePost =
  (handler: (req: NextApiRequest, res: NextApiResponse) => void | Promise<void>) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') handler(req, res);
    else res.status(405).end();
  };

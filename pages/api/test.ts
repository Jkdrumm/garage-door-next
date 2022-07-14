import type { NextApiRequest, NextApiResponse } from 'next';

const certificateTest = async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json('test');
};

export default certificateTest;

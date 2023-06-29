import type { NextRequest } from 'types';
import { getSession } from './getSession';

export const getUser = async (req: NextRequest) => {
  const session = await getSession({ req });
  if (!session) throw new Error('No session');
  const { user } = session;
  if (!user) throw new Error('No user');
  return user;
};

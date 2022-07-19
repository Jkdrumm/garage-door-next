import type { NextRequest } from '../../types';
import { getUser } from './getUser';
import { service } from '../../services';

export const getUserFromCache = async (req: NextRequest) => {
  const user = await getUser(req);
  return service.getUser(user.id);
};

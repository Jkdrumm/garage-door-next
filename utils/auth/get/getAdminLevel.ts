import type { NextRequest } from '../../types';
import { getUser } from './getUser';
import { UsersService } from '../../services';

export const getAdminLevel = async (req: NextRequest) => {
  const user = await getUser(req);
  return UsersService.getInstance().getAdminLevel(user.id);
};

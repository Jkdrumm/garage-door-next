import type { NextRequest } from 'types';
import { getUser } from './getUser';
import { UsersService } from 'services';

export const getUserLevel = async (req: NextRequest) => {
  const user = await getUser(req);
  return UsersService.getInstance().getUserLevel(user.id);
};

import { getAdminLevel, getUser } from '.';
import { AdminLevel } from '../../enums';
import { UsersService } from '../../services';
import { NextRequest } from '../../types';

export const getNumNotifications = async (req: NextRequest) => {
  const adminLevel = await getAdminLevel(req);
  return UsersService.getInstance().getNotificationCount(adminLevel);
};
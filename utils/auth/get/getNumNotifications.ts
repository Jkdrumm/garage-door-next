import { getAdminLevel } from '.';
import { service } from '../../services';
import { NextRequest } from '../../types';

export const getNumNotifications = async (req: NextRequest) => {
  const adminLevel = await getAdminLevel(req);
  return service.getNotificationCount(adminLevel);
};

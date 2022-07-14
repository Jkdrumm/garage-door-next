import { AdminLevel } from '../enums';

export const getAdminLevelText = (adminLevel: AdminLevel = AdminLevel.ACCOUNT) =>
  ['Account', 'Viewer', 'User', 'Admin'][adminLevel];

import { AdminLevel } from '../enums';

/**
 * Formats the adminLevel as text.
 * @param adminLevel The admin level to format
 * @returns The admin level as formatted text
 */
export const getAdminLevelText = (adminLevel: AdminLevel = AdminLevel.ACCOUNT) =>
  ['Account', 'Viewer', 'User', 'Admin'][adminLevel];

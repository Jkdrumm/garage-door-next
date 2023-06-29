import { UserLevel } from 'enums';

/**
 * Formats the userLevel as text.
 * @param userLevel The user level to format
 * @returns The user level as formatted text
 */
export const getUserLevelText = (userLevel: UserLevel = UserLevel.ACCOUNT) =>
  ['Account', 'Viewer', 'User', 'Admin'][userLevel];

import { UserLevel } from 'enums';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  userLevel: UserLevel;
}

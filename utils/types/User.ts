import { AdminLevel } from '../enums/AdminLevel';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  adminLevel: AdminLevel;
}

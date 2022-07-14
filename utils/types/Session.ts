import type { ISODateString } from 'next-auth/core/types';
import type { User } from './User';

export interface Session extends Record<string, unknown>, DefaultSession {}

interface DefaultSession extends Record<string, unknown> {
  user?: User;
  expires: ISODateString;
}

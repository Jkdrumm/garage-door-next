import { getSession as getNextAuthSession, GetSessionParams } from 'next-auth/react';
import type { Session } from 'types';

export const getSession = (params?: GetSessionParams): Promise<Session | null> => {
  return getNextAuthSession(params) as Promise<Session | null>;
};

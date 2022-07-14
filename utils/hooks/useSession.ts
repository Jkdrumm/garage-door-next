import { useSession as useNextAuthSession } from 'next-auth/react';
import type { Session, User } from '../types';

export const useSession = () => {
  const hook = useNextAuthSession() as SessionContextValue;
  if (hook.data?.user) (hook.data.user as any) = hook.data.user as User;
  return hook;
};

// Overriding types since manually since a generic type can't be set for useSession
export declare type SessionContextValue<R extends boolean = false> = R extends true
  ?
      | {
          data: Session;
          status: 'authenticated';
        }
      | {
          data: null;
          status: 'loading';
        }
  :
      | {
          data: Session;
          status: 'authenticated';
        }
      | {
          data: null;
          status: 'unauthenticated' | 'loading';
        };

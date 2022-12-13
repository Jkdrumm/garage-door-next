import type { GetServerSideProps } from 'next/types';
import { getUserFromCache } from './get';

/**
 * Requires being logged out for page access.
 * If logged in, will redirect to the home page.
 * @param getServerSideProps {@link GetServerSideProps}
 * @returns GetServerSideProps
 */
export function requireLoggedOut(getServerSideProps?: GetServerSideProps): GetServerSideProps {
  return async function (context) {
    try {
      await getUserFromCache(context.req);
      return {
        redirect: {
          destination: '/home',
          permanent: false
        }
      };
    } catch (e) {
      if (getServerSideProps) return getServerSideProps(context);
      return { props: { cookies: context.req.headers.cookie ?? '' } };
    }
  };
}

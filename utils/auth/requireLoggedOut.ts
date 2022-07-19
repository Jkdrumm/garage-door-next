import type { GetServerSideProps } from 'next/types';
import { getUserFromCache } from './get';

export const requireLoggedOut =
  (getServerSideProps?: GetServerSideProps): GetServerSideProps =>
  async context => {
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
      return { props: {} };
    }
  };

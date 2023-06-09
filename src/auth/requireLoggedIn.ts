import type { GetServerSideProps } from 'next/types';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { prefetchUserLevel, prefetchNotificationCount, prefetchUser } from 'hooks/prefetch';
import { UsersService } from 'services';
import { getUserFromCache } from 'auth/get';

/**
 * Requires being logged in for page access.
 * If logged out, will redirect to the URL origin.
 * @param getServerSideProps {@link GetServerSideProps}
 * @returns GetServerSideProps
 */
export function requireLoggedIn(getServerSideProps?: GetServerSideProps): GetServerSideProps {
  return async function (context) {
    try {
      const user = await getUserFromCache(context.req);
      const queryClient = new QueryClient();
      prefetchUser(queryClient, user);
      prefetchUserLevel(queryClient, user.userLevel);
      prefetchNotificationCount(queryClient, UsersService.getInstance().getNotificationCount(user.userLevel));
      const serverSideResult = {
        props: {
          dehydratedState: dehydrate(queryClient),
          cookies: context.req.headers.cookie ?? ''
        }
      };
      if (getServerSideProps) {
        const nestedServerSideResult = (await getServerSideProps(context)) as any;
        serverSideResult.props.dehydratedState.queries = nestedServerSideResult.props.dehydratedState.queries.concat(
          serverSideResult.props.dehydratedState.queries
        );
        serverSideResult.props.dehydratedState.mutations =
          nestedServerSideResult.props.dehydratedState.mutations.concat(
            serverSideResult.props.dehydratedState.mutations
          );
      }
      return serverSideResult;
    } catch (e) {
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      };
    }
  };
}

import type { GetServerSideProps } from 'next/types';
import { dehydrate, QueryClient } from 'react-query';
import { prefetchAdminLevel, prefetchNotificationCount, prefetchUser } from '../hooks/prefetch';
import { UsersService } from '../services';
import { getUserFromCache } from './get';

export const requireLoggedIn =
  (getServerSideProps?: GetServerSideProps): GetServerSideProps =>
  async context => {
    try {
      const user = await getUserFromCache(context.req);
      const queryClient = new QueryClient();
      prefetchUser(queryClient, user);
      prefetchAdminLevel(queryClient, user.adminLevel);
      prefetchNotificationCount(queryClient, UsersService.getInstance().getNotificationCount(user.adminLevel));
      const serverSideResult = {
        props: {
          dehydratedState: dehydrate(queryClient)
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

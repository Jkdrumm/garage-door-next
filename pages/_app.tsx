import type { GetLayout } from '../utils/types';
import type { NextPage } from 'next/types';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useState } from 'react';
import { Hydrate, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Chakra } from '../components/util';
import { SessionProvider } from 'next-auth/react';
import { useDefaultLayout } from '../components/layouts';

type NextPageWithLayout = NextPage & GetLayout;

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

// This is refactored into a separate component so that the layout components
// have access to the Providers (SessionProvider, QueryClientProvider)
const PageComponent = ({ Component, pageProps, router }: AppPropsWithLayout) => {
  const getLayout = Component.getLayout ?? useDefaultLayout;
  return getLayout(
    <>
      <Component {...pageProps} router={router} />
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </>
  );
};

export default function App({ Component, pageProps: { session, cookies, ...pageProps }, router }: AppPropsWithLayout) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false } } })
  );

  return (
    <>
      <Head>
        <title>Garage Door</title>
      </Head>
      <SessionProvider session={session} refetchInterval={0}>
        <QueryClientProvider client={queryClient}>
          <Hydrate state={pageProps?.dehydratedState}>
            <Chakra cookies={cookies}>
              <PageComponent Component={Component} pageProps={pageProps} router={router} />
            </Chakra>
          </Hydrate>
        </QueryClientProvider>
      </SessionProvider>
    </>
  );
}

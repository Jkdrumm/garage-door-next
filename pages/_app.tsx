import type { GetLayout } from '../utils/types';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { NextPage } from 'next/types';
import { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import { useDefaultLayout } from '../components/layouts';
import { useState } from 'react';
import Head from 'next/head';
import { theme } from '../utils/theme';

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

export default function App({ Component, pageProps: { session, ...pageProps }, router }: AppPropsWithLayout) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      <Head>
        <title>Garage Door</title>
      </Head>
      <SessionProvider session={session} refetchInterval={0}>
        <QueryClientProvider client={queryClient}>
          <Hydrate state={pageProps?.dehydratedState}>
            <ChakraProvider theme={theme}>
              <PageComponent Component={Component} pageProps={pageProps} router={router} />
            </ChakraProvider>
          </Hydrate>
        </QueryClientProvider>
      </SessionProvider>
    </>
  );
}

import { Flex, useColorModeValue } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';

export function DefaultLayout({ children }: PropsWithChildren) {
  return (
    <Flex minH="100vh" width="100vw" bg={useColorModeValue('gray.100', 'gray.900')} align="stretch" padding="25px">
      {children}
    </Flex>
  );
}

export function useDefaultLayout(page: React.ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
}

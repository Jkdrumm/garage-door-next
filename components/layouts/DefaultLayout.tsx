import { Flex, useColorModeValue } from '@chakra-ui/react';
import { ReactNode } from 'react';

export const DefaultLayout = ({ children }: { children: ReactNode }) => (
  <Flex minH="100vh" width="100vw" bg={useColorModeValue('gray.100', 'gray.900')} align="stretch" padding="25px">
    {children}
  </Flex>
);

export const useDefaultLayout = (page: React.ReactElement) => <DefaultLayout>{page}</DefaultLayout>;

import type { PropsWithChildren } from 'react';
import { ChakraProvider, cookieStorageManagerSSR, localStorageManager } from '@chakra-ui/react';
import { theme } from 'theme';

export interface ChakraProps extends PropsWithChildren {
  cookies: string;
}

export function Chakra({ cookies, children }: ChakraProps) {
  const colorModeManager = typeof cookies === 'string' ? cookieStorageManagerSSR(cookies) : localStorageManager;

  return (
    <ChakraProvider colorModeManager={colorModeManager} theme={theme}>
      {children}
    </ChakraProvider>
  );
}

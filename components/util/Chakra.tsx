import { ChakraProvider, cookieStorageManagerSSR, localStorageManager } from '@chakra-ui/react';
import { theme } from '../../utils/theme';

export interface ChakraProps {
  cookies: string;
  children: React.ReactNode;
}

export function Chakra({ cookies, children }: ChakraProps) {
  // b) Pass `colorModeManager` prop
  const colorModeManager = typeof cookies === 'string' ? cookieStorageManagerSSR(cookies) : localStorageManager;

  return (
    <ChakraProvider colorModeManager={colorModeManager} theme={theme}>
      {children}
    </ChakraProvider>
  );
}

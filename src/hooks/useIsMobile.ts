import { useMediaQuery } from '@chakra-ui/react';

/**
 * A Chakra Media query to determine a mobile screen size.
 */
export function useIsMobile() {
  const [isMobile] = useMediaQuery('(max-width: 48em)');
  return isMobile;
}

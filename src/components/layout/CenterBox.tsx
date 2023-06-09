import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import {
  Flex,
  useColorModeValue,
  Heading,
  Divider,
  useColorMode,
  Button,
  Grid,
  Spacer,
  forwardRef
} from '@chakra-ui/react';
import { useIsMobile } from 'hooks';

export interface CenterBoxProps {
  title: string;
  showColorToggleOnDesktop?: boolean;
  children: React.ReactNode;
}

/**
 * A centered box for displaying the main page content.
 */
export const CenterBox = forwardRef(({ title, showColorToggleOnDesktop, children, ...props }, ref) => {
  const isMobile = useIsMobile();
  const { toggleColorMode } = useColorMode();
  const themeIcon = useColorModeValue(<MoonIcon w="1.25em" h="1.25em" />, <SunIcon w="1.25em" h="1.25em" />);
  return (
    <Flex ref={ref} width="inherit" height="100%" direction="column" align="center" {...props}>
      <Flex
        mt={{ base: '33.33%', md: '250px' }}
        borderRadius="20px"
        bg={useColorModeValue('white', 'gray.700')}
        width={{ base: '100%', md: '480px' }}
        shadow={`0px 0px 32px 0px ${useColorModeValue('#4E4E4E2E', '#000000AA')}`}
        justify="center"
        align="center"
        direction="column">
        <Grid padding="16px" templateColumns={'repeat(3, 1fr)'} width="100%">
          <Spacer />
          <Heading textAlign="center" whiteSpace="nowrap">
            {title}
          </Heading>
          {isMobile || showColorToggleOnDesktop ? (
            <Flex justify="flex-end">
              <Button onClick={toggleColorMode}>{themeIcon}</Button>
            </Flex>
          ) : (
            <Spacer />
          )}
        </Grid>
        <Divider width="inherit" padding="0px -16px" />
        <Flex padding="16px" width="100%" height="100%" justify="center" direction="column" align="center">
          {children}
        </Flex>
      </Flex>
    </Flex>
  );
});

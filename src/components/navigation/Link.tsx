import {
  ChakraProps,
  forwardRef,
  Link as ChakraLink,
  LinkProps as ChakraLinkProps,
  useStyleConfig,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import type { LinkProps as NextLinkProps } from 'next/dist/client/link';

// Next.js links also have an 'as' property, so we'll rename it so that it is still available
export type LinkProps = Omit<NextLinkProps, 'as'> &
  ChakraLinkProps & {
    nextAs?: NextLinkProps['as'];
  };

/**
 * A Chakra styled {@link https://nextjs.org/docs/api-reference/next/link NextLink}
 */
export const Link = forwardRef<LinkProps & ChakraProps, 'a'>(
  ({ href, nextAs, replace, scroll, shallow, prefetch, children, ...props }, ref) => {
    const styles = useStyleConfig('Link', props) as ChakraProps & LinkProps;
    return (
      <NextLink
        passHref
        href={href}
        as={nextAs}
        replace={replace}
        scroll={scroll}
        shallow={shallow}
        prefetch={prefetch}>
        <ChakraLink ref={ref} {...styles} {...props}>
          {children}
        </ChakraLink>
      </NextLink>
    );
  },
);

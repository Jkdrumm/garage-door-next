import React from 'react';
import { Link as ChakraLink, LinkProps as ChakraLinkProps } from '@chakra-ui/react';
import NextLink from 'next/link';

export interface LinkProps extends ChakraLinkProps {}

export const Link = ({ href, ...rest }: LinkProps) => (
  <NextLink href={href?.toString() || ''} passHref>
    <ChakraLink {...rest} />
  </NextLink>
);

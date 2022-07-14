import type { IncomingMessage } from 'http';
import type { NextApiRequest } from 'next';
import type { NextApiRequestCookies } from 'next/dist/server/api-utils';

export type NextRequest = NextApiRequest | (IncomingMessage & { cookies: NextApiRequestCookies });

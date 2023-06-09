import type { NextPage } from 'next';
import { GetLayout } from './GetLayout';

export type PageWithLayout = React.FC<NextPage> & GetLayout;

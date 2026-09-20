import { RouteObject } from 'react-router-dom';
import { AppLayout } from '@/components';
import { Home } from '../elements';

export const readerRoutes: RouteObject = {
  element: <AppLayout />,
  children: [{ index: true, element: <Home /> }],
};

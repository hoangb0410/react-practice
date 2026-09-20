import { AppLayout, AppRoute } from '@/components';
import { ROUTES } from '@/constants';
import { RouteObject } from 'react-router-dom';
import { Profile } from '../elements';

export const accountRoutes: RouteObject = {
  element: (
    <AppRoute>
      <AppLayout />
    </AppRoute>
  ),
  children: [{ path: ROUTES.PROFILE, element: <Profile /> }],
};

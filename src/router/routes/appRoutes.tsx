import { RouteObject } from 'react-router-dom';
import { AppLayout } from '@/components';
import { ROUTES } from '@/constants';

/**
 * Main app routes, rendered inside `AppLayout`.
 * Wrap children in `<AppRoute />` to require a signed-in user.
 * Lazy-load pages with `lazyImport` from `@/utils`.
 */
export const appRoutes: RouteObject = {
  path: ROUTES.ROOT,
  element: <AppLayout />,
  children: [],
};

import { RouteObject } from 'react-router-dom';
import { AuthLayout } from '@/components';

/** Public auth routes (sign-in, forgot password, ...), rendered inside `AuthLayout`. */
export const authRoutes: RouteObject = {
  element: <AuthLayout />,
  children: [],
};

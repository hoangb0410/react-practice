import { FC, ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { useReduxUser } from '@/redux';
import { EUserRole } from '@/enums';
import { getDefaultRouteByRole } from '@/utils';

interface IProps {
  allowedRoles?: EUserRole[];
  children?: ReactNode;
}

/**
 * Guards routes that need a signed-in user.
 * Reads the user from Redux (HttpOnly cookies are not readable from JS).
 * If Redux and the server disagree, the 401 interceptor in `src/api/axiosInstance.ts` resyncs them.
 */
export const AppRoute: FC<IProps> = ({ allowedRoles, children }) => {
  const { user } = useReduxUser();

  // User doesn't login -> Login
  if (!user) {
    return <Navigate to={ROUTES.SIGN_IN} replace />;
  }

  if (allowedRoles && (!user.role || !allowedRoles.includes(user.role))) {
    return <Navigate to={getDefaultRouteByRole(user.role)} replace />;
  }

  return <>{children ?? <Outlet />}</>;
};

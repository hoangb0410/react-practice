import { FC, ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { useReduxUser } from '@/redux';

interface IProps {
  children?: ReactNode;
}

/**
 * Guards routes that need a signed-in user.
 * Reads the user from Redux (HttpOnly cookies are not readable from JS).
 * If Redux and the server disagree, the 401 interceptor in `src/api/axiosInstance.ts` resyncs them.
 */
export const AppRoute: FC<IProps> = ({ children }) => {
  const { user } = useReduxUser();

  if (!user) {
    return <Navigate to={ROUTES.SIGN_IN} replace />;
  }

  return <>{children ?? <Outlet />}</>;
};

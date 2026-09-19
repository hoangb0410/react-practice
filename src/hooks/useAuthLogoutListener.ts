import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AUTH_LOGOUT_EVENT } from '@/api';
import { ROUTES } from '@/constants';
import { useReduxUser } from '@/redux';

/** Clears the persisted user and redirects to sign-in when token refresh fails. */
export const useAuthLogoutListener = () => {
  const navigate = useNavigate();
  const { resetUserInfo } = useReduxUser();

  useEffect(() => {
    const handler = () => {
      resetUserInfo();
      navigate(ROUTES.SIGN_IN, { replace: true });
    };
    window.addEventListener(AUTH_LOGOUT_EVENT, handler);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handler);
  }, [navigate, resetUserInfo]);
};

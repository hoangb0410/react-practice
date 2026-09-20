import { RouteObject } from 'react-router-dom';
import { AuthLayout } from '@/components';
import { ROUTES } from '@/constants';
import { Register, SignIn, VerifyOtp } from '../elements';

/** Public auth routes (sign-in, forgot password, ...), rendered inside `AuthLayout`. */
export const authRoutes: RouteObject = {
  element: <AuthLayout />,
  children: [
    { path: ROUTES.SIGN_IN, element: <SignIn /> },
    { path: ROUTES.SIGN_UP, element: <Register /> },
    { path: ROUTES.VERIFY_OTP, element: <VerifyOtp /> },
  ],
};

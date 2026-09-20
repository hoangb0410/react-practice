import {
  IForgotPasswordFormValues,
  IRegisterFormValues,
  IRegisterResponse,
  IResetPasswordBody,
  ISignInFormValues,
  ISignInResponse,
  IUserInfo,
  IVerifyRegisterBody,
} from '@/interfaces';
import { axiosService } from '../axiosService';
import { EAuthEndpoint } from './auth.endpoint';

export const authApi = {
  signIn: (body: ISignInFormValues) =>
    axiosService.post<ISignInResponse, ISignInFormValues>(
      EAuthEndpoint.SIGN_IN,
      body
    ),

  register: (body: IRegisterFormValues) =>
    axiosService.post<IRegisterResponse, IRegisterFormValues>(
      EAuthEndpoint.REGISTER,
      body
    ),

  verifyRegister: (body: IVerifyRegisterBody) =>
    axiosService.post<ISignInResponse, IVerifyRegisterBody>(
      EAuthEndpoint.VERIFY_REGISTER,
      body
    ),

  signOut: () => axiosService.post<void>(EAuthEndpoint.SIGN_OUT),

  refreshToken: () => axiosService.post<void>(EAuthEndpoint.GET_NEW_TOKENS),

  forgotPassword: (body: IForgotPasswordFormValues) =>
    axiosService.post<void, IForgotPasswordFormValues>(
      EAuthEndpoint.FORGOT_PASSWORD,
      body
    ),

  resetPassword: (body: IResetPasswordBody) =>
    axiosService.post<void, IResetPasswordBody>(
      EAuthEndpoint.RESET_PASSWORD,
      body
    ),

  getCurrentUserProfile: () =>
    axiosService.get<IUserInfo>(EAuthEndpoint.GET_CURRENT_USER_PROFILE, {
      _skipAuthLogout: true,
    }),
};

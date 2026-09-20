import { EUserRole } from '@/enums';
import { IUserInfo } from './user.interface';

// Sign in
export interface ISignInFormValues {
  email: string;
  password: string;
}

export interface IRegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: EUserRole.READER | EUserRole.CREATOR;
  firstName?: string;
  lastName?: string;
}

export interface IRegisterResponse {
  hash: string;
}

export interface IVerifyRegisterBody {
  hash: string;
  otp: string;
}

export interface IForgotPasswordFormValues {
  email: string;
}

export interface IResetPasswordFormValues {
  newPassword: string;
  confirmNewPassword: string;
}

export interface IResetPasswordBody extends IResetPasswordFormValues {
  token: string;
}

export type ISignInResponse = IUserInfo;

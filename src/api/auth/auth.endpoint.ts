import { API_PREFIX } from '@/constants/common';

const AUTH = `${API_PREFIX}/auth`;

export enum EAuthEndpoint {
  SIGN_IN = `${AUTH}/login`,
  REGISTER = `${AUTH}/register`,
  VERIFY_REGISTER = `${AUTH}/verify-register`,
  SIGN_OUT = `${AUTH}/logout`,
  GET_NEW_TOKENS = `${AUTH}/refresh`,
  FORGOT_PASSWORD = `${AUTH}/forgot-password`,
  RESET_PASSWORD = `${AUTH}/reset-password`,
  GET_CURRENT_USER_PROFILE = `${API_PREFIX}/users`,
}

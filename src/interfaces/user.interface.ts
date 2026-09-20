import { EUserRole } from '@/enums/user';

/** App-wide user shape. Only `id` is required; adjust the rest to your backend. */
export interface IUserInfo {
  id: string | number;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarId?: number;
  avatar?: string;
  role?: EUserRole;
  createdAt?: string;
  updatedAt?: string;
}

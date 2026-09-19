/** App-wide user shape. Only `id` is required; adjust the rest to your backend. */
export interface IUserInfo {
  id: string | number;
  email?: string;
  fullName?: string;
  avatar?: string;
}

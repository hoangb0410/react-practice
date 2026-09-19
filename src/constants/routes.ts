/** Route paths shared by the router, guards and redirects. Extend per project. */
export const ROUTES = {
  ROOT: '/',
  SIGN_IN: '/sign-in',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

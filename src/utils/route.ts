import { ROUTES, RoutePath } from '@/constants';
import { EUserRole } from '@/enums';

export const getDefaultRouteByRole = (role?: EUserRole): RoutePath => {
  switch (role) {
    case EUserRole.ADMIN:
      return ROUTES.ADMIN;
    case EUserRole.CREATOR:
      return ROUTES.STUDIO;
    default:
      return ROUTES.ROOT; // reader hoặc không rõ
  }
};

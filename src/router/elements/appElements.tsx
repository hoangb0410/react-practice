import { lazyImport } from '@/utils';

export const { Home } = lazyImport(() => import('@/pages'), 'Home');
export const { Profile } = lazyImport(() => import('@/pages'), 'Profile');

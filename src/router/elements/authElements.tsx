import { lazyImport } from '@/utils';

export const { SignIn } = lazyImport(() => import('@/modules/auth'), 'SignIn');
export const { Register } = lazyImport(
  () => import('@/modules/auth'),
  'Register'
);

export const { VerifyOtp } = lazyImport(
  () => import('@/modules/auth'),
  'VerifyOtp'
);

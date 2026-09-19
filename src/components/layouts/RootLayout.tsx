import { Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AppLoader } from '@/components';
import { queryClient } from '@/constants';
import { useAuthLogoutListener } from '@/hooks';

export const RootLayout = () => {
  useAuthLogoutListener();

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<AppLoader />}>
        <Outlet />
      </Suspense>
      <ReactQueryDevtools initialIsOpen={false} />
      <ToastContainer closeButton={false} position="bottom-left" />
    </QueryClientProvider>
  );
};

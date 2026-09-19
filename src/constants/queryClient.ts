import { QueryClient } from '@tanstack/react-query';
import { config } from './env';

const staleTime = config.env.VITE_ENV === 'DEVELOP' ? 5 * 60 * 1000 : 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime,
      refetchOnMount: true,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: false,
      retryOnMount: false,
    },
  },
});

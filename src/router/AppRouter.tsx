import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { NotFound, RootLayout } from '@/components';
import { accountRoutes, authRoutes, readerRoutes } from './routes';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      authRoutes,
      readerRoutes,
      accountRoutes,
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;

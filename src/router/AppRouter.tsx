import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { NotFound, RootLayout } from '@/components';
import { appRoutes, authRoutes } from './routes';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [authRoutes, appRoutes, { path: '*', element: <NotFound /> }],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;

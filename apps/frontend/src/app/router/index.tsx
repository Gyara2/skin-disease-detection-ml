import { CasoDetallePage } from '@/pages/CasoDetallePage';
import { CasosPage } from '@/pages/CasosPage';
import { LoginPage } from '@/pages/LoginPage';
import { MainLayout } from '@/shared/layout/MainLayout';
import { Navigate, createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to='/login' replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <MainLayout />,
    children: [
      {
        path: '/casos',
        element: <CasosPage />,
      },
      {
        path: '/casos/:id',
        element: <CasoDetallePage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to='/login' replace />,
  },
]);

import { CasoDetallePage } from '@/pages/CasoDetallePage';
import { CasosPage } from '@/pages/CasosPage';
import { LoginPage } from '@/pages/LoginPage';
import { UsuariosPage } from '@/pages/UsuariosPage';
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
        element: <Navigate to='resumen' replace />,
      },
      {
        path: '/casos/:id/:section',
        element: <CasoDetallePage />,
      },
      {
        path: '/usuarios',
        element: <UsuariosPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to='/login' replace />,
  },
]);

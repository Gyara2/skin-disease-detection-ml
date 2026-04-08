import { useAuthStore } from '@/features/auth/store/auth.store';
import {
  ClipboardList,
  HeartPulse,
  LogOut,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

export const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, isAuthenticated, logout } = useAuthStore();

  const pageMeta = location.pathname.startsWith('/casos/')
    ? {
        eyebrow: 'Caso',
        title: 'Detalle del caso',
        description:
          'Consulta la imagen inicial, la prediccion automatica, el diagnostico clinico y la validacion final.',
      }
    : {
        eyebrow: 'Casos',
        title: 'Listado de casos',
        description:
          'Consulta los casos disponibles, su estado, su responsable y el flujo clinico asociado.',
      };

  const currentDate = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const rolLabel = usuario
    ? {
        ADMIN: 'Administrador',
        ESPECIALISTA: 'Especialista',
        PACIENTE: 'Paciente',
      }[usuario.rol]
    : 'Sin sesion';

  return (
    <div className='relative min-h-screen overflow-hidden text-slate-950'>
      <div className='absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_58%)]' />
      <div className='absolute -left-20 top-20 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl' />
      <div className='absolute right-0 top-28 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl' />

      <div className='relative flex min-h-screen flex-col lg:flex-row'>
        <aside className='flex w-full flex-col border-b border-slate-200/80 bg-slate-950 px-5 py-6 text-white lg:min-h-screen lg:w-80 lg:border-b-0 lg:border-r lg:border-slate-800'>
          <div className='inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 shadow-lg shadow-cyan-500/20'>
            <HeartPulse className='h-6 w-6' />
          </div>

          <div className='mt-6 space-y-2'>
            <p className='text-xs uppercase tracking-[0.32em] text-cyan-200/70'>
              Skin Disease ML
            </p>
            <h1 className='text-2xl font-semibold tracking-tight text-white'>
              Panel de casos
            </h1>
            <p className='text-sm leading-6 text-slate-300'>
              Vista principal del flujo clinico: imagen, prediccion,
              diagnostico y validacion.
            </p>
          </div>

          <div className='mt-8 rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur'>
            <div className='flex items-center gap-3'>
              <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-cyan-200'>
                <UserRound className='h-5 w-5' />
              </div>
              <div>
                <p className='text-sm font-medium text-white'>
                  {usuario?.nombre ?? 'Sin sesion activa'}
                </p>
                <p className='text-xs uppercase tracking-[0.24em] text-slate-400'>
                  {rolLabel}
                </p>
              </div>
            </div>
          </div>

          <nav className='mt-8 space-y-3'>
            <p className='text-xs uppercase tracking-[0.28em] text-slate-400'>
              Navegacion
            </p>

            <NavLink
              to='/casos'
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                  isActive
                    ? 'border-cyan-400/40 bg-cyan-400/10 text-white shadow-lg shadow-cyan-500/10'
                    : 'border-white/8 bg-white/[0.03] text-slate-300 hover:border-white/15 hover:bg-white/[0.07] hover:text-white'
                }`
              }
            >
              <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-cyan-200 transition group-hover:bg-white/15'>
                <ClipboardList className='h-5 w-5' />
              </div>
              <div>
                <p className='font-medium'>Casos clinicos</p>
                <p className='text-xs text-slate-400'>
                  Imagen, prediccion, diagnostico y validacion
                </p>
              </div>
            </NavLink>
          </nav>

          <button
            type='button'
            onClick={() => {
              if (isAuthenticated) {
                logout();
              }

              navigate('/login');
            }}
            className='mt-8 inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white lg:mt-auto'
          >
            <LogOut className='h-4 w-4' />
            {isAuthenticated ? 'Cerrar sesion' : 'Ir a acceso'}
          </button>
        </aside>

        <div className='flex min-h-screen min-w-0 flex-1 flex-col'>
          <header className='border-b border-sky-100/70 bg-white/70 px-4 py-5 backdrop-blur-xl sm:px-6 lg:px-10'>
            <div className='mx-auto flex max-w-6xl flex-col gap-5 xl:flex-row xl:items-center xl:justify-between'>
              <div className='space-y-2'>
                <p className='inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.32em] text-sky-700'>
                  <Sparkles className='h-3.5 w-3.5' />
                  {pageMeta.eyebrow}
                </p>
                <div>
                  <h2 className='text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl'>
                    {pageMeta.title}
                  </h2>
                  <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-600'>
                    {pageMeta.description}
                  </p>
                </div>
              </div>

              <div className='grid gap-3 sm:grid-cols-2'>
                <div className='rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-[0_16px_40px_-32px_rgba(14,165,233,0.7)] backdrop-blur'>
                  <p className='text-xs font-medium uppercase tracking-[0.28em] text-slate-500'>
                    Fecha
                  </p>
                  <p className='mt-2 text-sm font-medium capitalize text-slate-900'>
                    {currentDate}
                  </p>
                </div>

                <div className='rounded-2xl border border-sky-100 bg-gradient-to-br from-cyan-50 via-white to-sky-50 px-4 py-3 shadow-[0_16px_40px_-32px_rgba(2,132,199,0.8)]'>
                  <p className='text-xs font-medium uppercase tracking-[0.28em] text-sky-700'>
                    Usuario
                  </p>
                  <p className='mt-2 text-sm font-medium text-slate-900'>
                    {usuario?.nombre ?? 'Sin sesion activa'}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <main className='flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8'>
            <div className='mx-auto max-w-6xl'>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

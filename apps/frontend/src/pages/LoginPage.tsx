import {
  ArrowRight,
  HeartPulse,
  LoaderCircle,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from 'lucide-react';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { useUsuarios } from '@/features/usuarios/hooks/useUsuarios';
import { getUsuarioNombreCompleto, type Rol } from '@/shared/types';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuthStore();
  const { data: usuarios = [], error, isLoading } = useUsuarios();

  const rolLabel: Record<Rol, string> = {
    PACIENTE: 'Paciente',
    ESPECIALISTA: 'Especialista',
    ADMIN: 'Administrador',
  };

  const rolIcon = {
    PACIENTE: UserRound,
    ESPECIALISTA: Stethoscope,
    ADMIN: ShieldCheck,
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/casos');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className='relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-10'>
      <div className='absolute left-0 top-0 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl' />
      <div className='absolute bottom-0 right-0 h-80 w-80 rounded-full bg-sky-200/35 blur-3xl' />

      <div className='relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl items-center justify-center'>
        <section className='w-full rounded-[36px] border border-white/80 bg-white/90 p-6 shadow-[0_30px_90px_-55px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8'>
          <div className='mx-auto flex max-w-sm flex-col items-center text-center'>
            <div className='inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'>
              <HeartPulse className='h-8 w-8' />
            </div>

            <p className='mt-6 text-xs font-medium uppercase tracking-[0.32em] text-sky-700'>
              Skin Disease ML
            </p>
            <h1 className='mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl'>
              Iniciar sesión
            </h1>
            <p className='mt-3 text-sm leading-7 text-slate-600'>
              Selecciona un usuario para acceder al sistema.
            </p>
          </div>

          {isLoading ? (
            <div className='mt-8 inline-flex items-center gap-3 text-sm font-medium text-sky-700'>
              <LoaderCircle className='h-4 w-4 animate-spin' />
              Cargando usuarios...
            </div>
          ) : null}

          {error ? (
            <div className='mt-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
              No se pudieron cargar los usuarios disponibles.
            </div>
          ) : null}

          <div className='mt-8 space-y-3'>
            {usuarios.map((usuario) => {
              const Icon = rolIcon[usuario.rol];

              return (
                <button
                  key={usuario.id}
                  type='button'
                  className='cursor-pointer inline-flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-900'
                  onClick={() => {
                    login(usuario);
                  }}
                >
                  <span className='inline-flex items-center gap-3'>
                    <span className='flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-700'>
                      <Icon className='h-5 w-5' />
                    </span>
                    <span>
                      <span className='block text-sm font-medium text-slate-900'>
                        {getUsuarioNombreCompleto(usuario)}
                      </span>
                      <span className='block text-xs uppercase tracking-[0.24em] text-slate-500'>
                        {rolLabel[usuario.rol]}
                      </span>
                    </span>
                  </span>
                  <ArrowRight className='h-4 w-4 shrink-0' />
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

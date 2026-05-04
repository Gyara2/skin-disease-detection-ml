import {
  HeartPulse,
  LoaderCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

import { loginFromApi, mapLoginResponseToUsuario } from '@/features/auth/services/auth.api';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

const getErrorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error ? error.message : fallback;
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/casos');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await loginFromApi({ email, password });
      const usuario = mapLoginResponseToUsuario(response);
      login(usuario);
    } catch (err) {
      setError(getErrorMessage(err, 'Credenciales incorrectas'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-10'>
      <div className='absolute left-0 top-0 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl' />
      <div className='absolute bottom-0 right-0 h-80 w-80 rounded-full bg-sky-200/35 blur-3xl' />

      <div className='relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl items-center justify-center'>
        <section className='w-full rounded-[36px] border border-white/80 bg-white/90 p-6 shadow-[0_30px_90px_-55px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10'>
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
              Ingresa tus credenciales para acceder al sistema.
            </p>
          </div>

          <form className='mt-8 space-y-5' onSubmit={handleSubmit}>
            {/* CORREO - Se añade flex y gap */}
            <label className='flex flex-col rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus-within:border-sky-500 transition-colors'>
              <span className='block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400'>
                Correo electrónico
              </span>
              <input
                type='email'
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder='correo@dominio.com'
                className='mt-1 w-full bg-transparent text-slate-950 outline-none placeholder:text-slate-300'
                disabled={isLoading}
                required
              />
            </label>

            {/* CONTRASEÑA - Se añade flex y alineación para el icono */}
            <label className='flex flex-col rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus-within:border-sky-500 transition-colors'>
              <span className='block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400'>
                Contraseña
              </span>
              <div className='relative mt-1 flex items-center'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder='Tu contraseña'
                  className='w-full bg-transparent text-slate-950 outline-none placeholder:text-slate-300'
                  disabled={isLoading}
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='ml-2 text-slate-400 hover:text-slate-600'
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                </button>
              </div>
            </label>

            {error && (
              <div className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
                {error}
              </div>
            )}

            <button
              type='submit'
              disabled={isLoading || !email.trim() || !password.trim()}
              className='inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300'
            >
              {isLoading ? (
                <>
                  <LoaderCircle className='h-4 w-4 animate-spin' />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

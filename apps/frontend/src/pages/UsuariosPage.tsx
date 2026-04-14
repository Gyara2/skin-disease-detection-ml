import { LoaderCircle, ShieldCheck, Stethoscope, UserRound, Users } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { useAsignarRolUsuario } from '@/features/usuarios/hooks/useAsignarRolUsuario';
import { useCrearUsuario } from '@/features/usuarios/hooks/useCrearUsuario';
import { useUsuarios } from '@/features/usuarios/hooks/useUsuarios';
import { CustomSelect, type CustomSelectOption } from '@/shared/components/CustomSelect';
import {
  getUsuarioNombreCompleto,
  type Rol,
  type RolGestionable,
  type Usuario,
} from '@/shared/types';

const rolLabel: Record<Rol, string> = {
  PACIENTE: 'Paciente',
  ESPECIALISTA: 'Especialista',
  ADMIN: 'Administrador',
};

const rolIcon = {
  PACIENTE: UserRound,
  ESPECIALISTA: Stethoscope,
  ADMIN: ShieldCheck,
} satisfies Record<Rol, typeof UserRound>;

const rolGestionableOptions = [
  { value: 'PACIENTE', label: 'Paciente' },
  { value: 'ESPECIALISTA', label: 'Especialista' },
] satisfies readonly CustomSelectOption<RolGestionable>[];

const rolOptions = [
  { value: 'PACIENTE', label: 'Paciente' },
  { value: 'ESPECIALISTA', label: 'Especialista' },
  { value: 'ADMIN', label: 'Administrador' },
] satisfies readonly CustomSelectOption<Rol>[];

const getErrorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error ? error.message : fallback;
};

export const UsuariosPage = () => {
  const { usuario, isAuthenticated, login } = useAuthStore();
  const { data: usuarios = [], error, isLoading } = useUsuarios();
  const crearUsuarioMutation = useCrearUsuario();
  const asignarRolMutation = useAsignarRolUsuario();
  const [nuevoDni, setNuevoDni] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoApellido1, setNuevoApellido1] = useState('');
  const [nuevoApellido2, setNuevoApellido2] = useState('');
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevoRol, setNuevoRol] = useState<RolGestionable>('PACIENTE');
  const [crearUsuarioFeedback, setCrearUsuarioFeedback] = useState<string | null>(null);
  const [rolesDraft, setRolesDraft] = useState<Record<string, Rol>>({});
  const [actualizandoRolUsuarioId, setActualizandoRolUsuarioId] = useState<string | null>(null);

  useEffect(() => {
    setRolesDraft((current) => {
      const next: Record<string, Rol> = {};

      usuarios.forEach((item) => {
        next[item.id] = current[item.id] ?? item.rol;
      });

      return next;
    });
  }, [usuarios]);

  const usuariosOrdenados = useMemo(() => {
    return [...usuarios].sort((left, right) => {
      if (left.rol === 'ADMIN' && right.rol !== 'ADMIN') {
        return -1;
      }

      if (left.rol !== 'ADMIN' && right.rol === 'ADMIN') {
        return 1;
      }

      return getUsuarioNombreCompleto(left).localeCompare(
        getUsuarioNombreCompleto(right),
        'es-ES',
      );
    });
  }, [usuarios]);

  const handleCrearUsuario = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCrearUsuarioFeedback(null);

    try {
      const nuevoUsuario = await crearUsuarioMutation.mutateAsync({
        dni: nuevoDni,
        nombre: nuevoNombre,
        apellido1: nuevoApellido1,
        apellido2: nuevoApellido2,
        email: nuevoEmail,
        rol: nuevoRol,
      });

      setNuevoDni('');
      setNuevoNombre('');
      setNuevoApellido1('');
      setNuevoApellido2('');
      setNuevoEmail('');
      setCrearUsuarioFeedback(
        `Usuario "${getUsuarioNombreCompleto(nuevoUsuario)}" creado correctamente.`,
      );
    } catch (mutationError) {
      setCrearUsuarioFeedback(
        getErrorMessage(mutationError, 'No se pudo crear el usuario.'),
      );
    }
  };

  const handleAsignarRol = async (usuarioItem: Usuario) => {
    const nextRol = rolesDraft[usuarioItem.id] ?? usuarioItem.rol;

    if (nextRol === usuarioItem.rol) {
      return;
    }

    setActualizandoRolUsuarioId(usuarioItem.id);

    try {
      const usuarioActualizado = await asignarRolMutation.mutateAsync({
        usuarioId: usuarioItem.id,
        input: { rol: nextRol },
      });

      if (usuario?.id === usuarioActualizado.id) {
        login(usuarioActualizado);
      }
    } catch (mutationError) {
      setCrearUsuarioFeedback(
        getErrorMessage(mutationError, 'No se pudo actualizar el rol.'),
      );
      setRolesDraft((current) => ({
        ...current,
        [usuarioItem.id]: usuarioItem.rol,
      }));
    } finally {
      setActualizandoRolUsuarioId(null);
    }
  };

  if (!isAuthenticated || !usuario) {
    return <Navigate to='/login' replace />;
  }

  if (usuario.rol !== 'ADMIN') {
    return <Navigate to='/casos' replace />;
  }

  if (isLoading) {
    return (
      <div className='rounded-[28px] border border-sky-100 bg-white/85 p-6 shadow-[0_24px_60px_-40px_rgba(14,165,233,0.65)] backdrop-blur'>
        <div className='inline-flex items-center gap-3 text-sm font-medium text-sky-700'>
          <LoaderCircle className='h-4 w-4 animate-spin' />
          Cargando usuarios...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='rounded-[28px] border border-red-200 bg-white/85 p-6 text-red-700 shadow-[0_24px_60px_-40px_rgba(239,68,68,0.45)] backdrop-blur'>
        No se pudieron cargar los usuarios.
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <section className='rounded-[28px] border border-sky-100 bg-white/90 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.28)]'>
        <div className='space-y-2'>
          <p className='text-xs font-medium uppercase tracking-[0.28em] text-sky-700'>
            Nuevo usuario
          </p>
          <h1 className='text-xl font-semibold tracking-tight text-slate-950'>
            Creación de usuarios
          </h1>
          <p className='text-sm leading-6 text-slate-600'>
            Registra nuevos perfiles con rol de paciente o especialista.
          </p>
        </div>

        <form className='mt-5 grid gap-3 md:grid-cols-2' onSubmit={handleCrearUsuario}>
          <label className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'>
            <span className='block text-xs font-medium uppercase tracking-[0.24em] text-slate-500'>
              DNI
            </span>
            <input
              value={nuevoDni}
              onChange={(event) => setNuevoDni(event.target.value.toUpperCase())}
              placeholder='12345678A'
              className='mt-2 w-full bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400'
              disabled={crearUsuarioMutation.isPending}
            />
          </label>

          <label className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'>
            <span className='block text-xs font-medium uppercase tracking-[0.24em] text-slate-500'>
              Nombre
            </span>
            <input
              value={nuevoNombre}
              onChange={(event) => setNuevoNombre(event.target.value)}
              placeholder='Nombre'
              className='mt-2 w-full bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400'
              disabled={crearUsuarioMutation.isPending}
            />
          </label>

          <label className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'>
            <span className='block text-xs font-medium uppercase tracking-[0.24em] text-slate-500'>
              Primer apellido
            </span>
            <input
              value={nuevoApellido1}
              onChange={(event) => setNuevoApellido1(event.target.value)}
              placeholder='Primer apellido'
              className='mt-2 w-full bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400'
              disabled={crearUsuarioMutation.isPending}
            />
          </label>

          <label className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'>
            <span className='block text-xs font-medium uppercase tracking-[0.24em] text-slate-500'>
              Segundo apellido
            </span>
            <input
              value={nuevoApellido2}
              onChange={(event) => setNuevoApellido2(event.target.value)}
              placeholder='Segundo apellido (opcional)'
              className='mt-2 w-full bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400'
              disabled={crearUsuarioMutation.isPending}
            />
          </label>

          <label className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 md:col-span-2'>
            <span className='block text-xs font-medium uppercase tracking-[0.24em] text-slate-500'>
              Email
            </span>
            <input
              value={nuevoEmail}
              onChange={(event) => setNuevoEmail(event.target.value)}
              placeholder='correo@dominio.com'
              className='mt-2 w-full bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400'
              disabled={crearUsuarioMutation.isPending}
            />
          </label>

          <CustomSelect
            label='Rol'
            value={nuevoRol}
            onChange={setNuevoRol}
            options={rolGestionableOptions}
            disabled={crearUsuarioMutation.isPending}
            containerClassName='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 md:col-span-1'
          />

          <button
            type='submit'
            disabled={
              crearUsuarioMutation.isPending ||
              !nuevoDni.trim() ||
              !nuevoNombre.trim() ||
              !nuevoApellido1.trim() ||
              !nuevoEmail.trim()
            }
            className='inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 md:self-end'
          >
            {crearUsuarioMutation.isPending ? (
              <>
                <LoaderCircle className='h-4 w-4 animate-spin' />
                Creando...
              </>
            ) : (
              'Crear usuario'
            )}
          </button>
        </form>

        {crearUsuarioFeedback ? (
          <p className='mt-3 text-sm text-slate-600'>{crearUsuarioFeedback}</p>
        ) : null}
      </section>

      <section className='overflow-hidden rounded-[28px] border border-slate-200 bg-white/90 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.28)]'>
        <div className='flex items-center justify-between border-b border-slate-100 px-5 py-4'>
          <p className='inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.24em] text-slate-500'>
            <Users className='h-3.5 w-3.5' />
            Listado de usuarios
          </p>
          <span className='text-sm text-slate-600'>
            Total: <span className='font-medium text-slate-900'>{usuariosOrdenados.length}</span>
          </span>
        </div>

        <div className='divide-y divide-slate-100'>
          {usuariosOrdenados.map((item) => {
            const Icon = rolIcon[item.rol];
            const selectedRol = rolesDraft[item.id] ?? item.rol;
            const isUpdating = actualizandoRolUsuarioId === item.id;
            const isAdminPrincipal = item.id === 'admin-1';
            const isDirty = selectedRol !== item.rol;

            return (
              <div key={item.id} className='grid gap-3 px-5 py-4 md:grid-cols-[1.1fr_0.8fr_auto] md:items-end'>
                <div className='min-w-0'>
                  <p className='text-xs font-medium uppercase tracking-[0.24em] text-slate-500'>
                    Usuario
                  </p>
                  <p className='mt-2 truncate text-sm font-medium text-slate-950'>
                    {getUsuarioNombreCompleto(item)}
                  </p>
                  <p className='mt-1 text-xs text-slate-500'>{item.email}</p>
                  <p className='mt-1 inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-500'>
                    <Icon className='h-3.5 w-3.5' />
                    {rolLabel[item.rol]}
                  </p>
                </div>

                <CustomSelect
                  label='Rol asignado'
                  value={selectedRol}
                  onChange={(value) =>
                    setRolesDraft((current) => ({
                      ...current,
                      [item.id]: value,
                    }))
                  }
                  options={rolOptions}
                  disabled={isUpdating || isAdminPrincipal}
                  containerClassName='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'
                />

                <button
                  type='button'
                  disabled={isUpdating || !isDirty || isAdminPrincipal}
                  onClick={() => {
                    void handleAsignarRol(item);
                  }}
                  className='inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 md:self-end'
                >
                  {isUpdating ? (
                    <>
                      <LoaderCircle className='h-4 w-4 animate-spin' />
                      Guardando...
                    </>
                  ) : (
                    'Guardar rol'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

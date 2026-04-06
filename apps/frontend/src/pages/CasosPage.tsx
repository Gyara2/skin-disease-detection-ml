import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Filter,
  LoaderCircle,
  Stethoscope,
  UserRound,
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { useCasos } from '@/features/casos/hooks/useCasos';
import { useState } from 'react';

export const CasosPage = () => {
  const { usuario, isAuthenticated } = useAuthStore();
  const { data, error, isLoading } = useCasos();
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [especialistaFiltro, setEspecialistaFiltro] = useState('todos');

  if (!isAuthenticated || !usuario) {
    return <Navigate to='/login' replace />;
  }

  if (isLoading) {
    return (
      <div className='rounded-[28px] border border-sky-100 bg-white/85 p-6 shadow-[0_24px_60px_-40px_rgba(14,165,233,0.65)] backdrop-blur'>
        <div className='inline-flex items-center gap-3 text-sm font-medium text-sky-700'>
          <LoaderCircle className='h-4 w-4 animate-spin' />
          Cargando casos...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='rounded-[28px] border border-red-200 bg-white/85 p-6 text-red-700 shadow-[0_24px_60px_-40px_rgba(239,68,68,0.45)] backdrop-blur'>
        No se pudieron cargar los casos.
      </div>
    );
  }

  const casos = data ?? [];

  const casosPorRol =
    usuario.rol === 'PACIENTE'
      ? casos.filter((caso) => caso.pacienteId === usuario.id)
      : usuario.rol === 'ESPECIALISTA'
        ? casos.filter((caso) => caso.especialistaId === usuario.id)
        : casos;

  const especialistasDisponibles = Array.from(
    new Map(
      casos.map((caso) => [caso.especialistaId, caso.especialistaNombre]),
    ).entries(),
  );

  const casosVisibles = casosPorRol
    .filter((caso) =>
      estadoFiltro === 'todos' ? true : caso.estado === estadoFiltro,
    )
    .filter((caso) =>
      usuario.rol === 'ADMIN' && especialistaFiltro !== 'todos'
        ? caso.especialistaId === especialistaFiltro
        : true,
    )
    .sort((a, b) => b.creado.getTime() - a.creado.getTime());

  const resumenAdmin = [
    {
      label: 'Total',
      value: casosVisibles.length,
      icon: ClipboardList,
    },
    {
      label: 'Pendientes',
      value: casosVisibles.filter((caso) => caso.estado === 'pendiente').length,
      icon: Filter,
    },
    {
      label: 'Completados',
      value: casosVisibles.filter((caso) => caso.estado === 'completado')
        .length,
      icon: CheckCircle2,
    },
  ];

  if (!casosVisibles.length) {
    const emptyMessage =
      usuario.rol === 'PACIENTE'
        ? 'No tienes casos registrados.'
        : usuario.rol === 'ESPECIALISTA'
          ? estadoFiltro === 'todos'
            ? 'No hay casos asignados.'
            : 'No hay casos asignados para el estado seleccionado.'
          : 'No hay casos que coincidan con los filtros seleccionados.';

    return (
      <div className='rounded-[28px] border border-sky-100 bg-white/85 p-6 shadow-[0_24px_60px_-40px_rgba(14,165,233,0.45)] backdrop-blur'>
        <div className='inline-flex items-center gap-3 text-sm font-medium text-slate-700'>
          <ClipboardList className='h-4 w-4 text-sky-700' />
          {emptyMessage}
        </div>
      </div>
    );
  }

  if (usuario.rol === 'PACIENTE') {
    return (
      <div className='space-y-5'>
        <div>
          <p className='text-xs font-medium uppercase tracking-[0.28em] text-sky-700'>
            Mis casos
          </p>
          <h1 className='mt-2 text-2xl font-semibold tracking-tight text-slate-950'>
            Mi historial
          </h1>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            Consulta el estado y la fecha de creacion de tus casos.
          </p>
        </div>

        <div className='space-y-3'>
          {casosVisibles.map((caso) => (
            <Link
              key={caso.id}
              to={`/casos/${caso.id}`}
              className='flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/90 px-5 py-4 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.35)] transition hover:border-sky-300 hover:bg-sky-50'
            >
              <div>
                <p className='text-sm font-semibold text-slate-950'>
                  Caso #{caso.id}
                </p>
                <p className='mt-1 text-sm text-slate-500'>
                  {caso.creado.toLocaleDateString('es-ES')}
                </p>
              </div>

              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${caso.estadoColor}`}
              >
                {caso.estadoLabel}
              </span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (usuario.rol === 'ESPECIALISTA') {
    return (
      <div className='space-y-5'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
          <div>
            <p className='text-xs font-medium uppercase tracking-[0.28em] text-sky-700'>
              Casos asignados
            </p>
            <h1 className='mt-2 text-2xl font-semibold tracking-tight text-slate-950'>
              Lista de trabajo
            </h1>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              Revisa los casos asignados y filtra por estado cuando necesites
              consultar revisiones anteriores.
            </p>
          </div>

          <label className='rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.35)] lg:min-w-56'>
            <span className='block text-xs font-medium uppercase tracking-[0.24em] text-slate-500'>
              Estado
            </span>
            <select
              value={estadoFiltro}
              onChange={(event) => setEstadoFiltro(event.target.value)}
              className='mt-2 w-full bg-transparent text-sm font-medium text-slate-900 outline-none'
            >
              <option value='todos'>Todos</option>
              <option value='pendiente'>Pendiente</option>
              <option value='en_proceso'>En proceso</option>
              <option value='completado'>Completado</option>
            </select>
          </label>
        </div>

        <div className='grid gap-4 xl:grid-cols-2'>
          {casosVisibles.map((caso) => (
            <Link
              key={caso.id}
              to={`/casos/${caso.id}`}
              className='rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.28)] transition hover:border-sky-300 hover:bg-sky-50'
            >
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <p className='text-xs font-medium uppercase tracking-[0.28em] text-sky-700'>
                    Caso #{caso.id}
                  </p>
                  <h2 className='mt-3 text-xl font-semibold tracking-tight text-slate-950'>
                    {caso.pacienteNombre}
                  </h2>
                </div>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${caso.estadoColor}`}
                >
                  {caso.estadoLabel}
                </span>
              </div>

              <div className='mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500'>
                <span className='inline-flex items-center gap-2'>
                  <CalendarDays className='h-4 w-4 text-sky-700' />
                  {caso.creado.toLocaleDateString('es-ES')}
                </span>

                <span className='inline-flex items-center gap-2 font-medium text-sky-700'>
                  Ver caso
                  <ArrowRight className='h-4 w-4' />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <p className='text-xs font-medium uppercase tracking-[0.28em] text-sky-700'>
            Administracion
          </p>
          <h1 className='mt-2 text-2xl font-semibold tracking-tight text-slate-950'>
            Todos los casos
          </h1>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            Consulta todos los casos y filtra por estado o especialista.
          </p>
        </div>

        <div className='grid gap-3 sm:grid-cols-2'>
          <label className='rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.35)]'>
            <span className='block text-xs font-medium uppercase tracking-[0.24em] text-slate-500'>
              Estado
            </span>
            <select
              value={estadoFiltro}
              onChange={(event) => setEstadoFiltro(event.target.value)}
              className='mt-2 w-full bg-transparent text-sm font-medium text-slate-900 outline-none'
            >
              <option value='todos'>Todos</option>
              <option value='pendiente'>Pendiente</option>
              <option value='en_proceso'>En proceso</option>
              <option value='completado'>Completado</option>
            </select>
          </label>

          <label className='rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.35)]'>
            <span className='block text-xs font-medium uppercase tracking-[0.24em] text-slate-500'>
              Especialista
            </span>
            <select
              value={especialistaFiltro}
              onChange={(event) => setEspecialistaFiltro(event.target.value)}
              className='mt-2 w-full bg-transparent text-sm font-medium text-slate-900 outline-none'
            >
              <option value='todos'>Todos</option>
              {especialistasDisponibles.map(
                ([especialistaId, especialistaNombre]) => (
                  <option key={especialistaId} value={especialistaId}>
                    {especialistaNombre}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>
      </div>

      <section className='grid gap-4 md:grid-cols-3'>
        {resumenAdmin.map((card) => (
          <article
            key={card.label}
            className='rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.28)]'
          >
            <div className='flex items-center justify-between gap-3'>
              <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700'>
                <card.icon className='h-5 w-5' />
              </div>
              <span className='text-3xl font-semibold tracking-tight text-slate-950'>
                {card.value}
              </span>
            </div>
            <p className='mt-4 text-sm font-medium text-slate-900'>
              {card.label}
            </p>
          </article>
        ))}
      </section>

      <section className='overflow-hidden rounded-[28px] border border-slate-200 bg-white/90 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.28)]'>
        <div className='hidden grid-cols-[1.1fr_1.1fr_0.9fr_0.9fr_32px] gap-4 border-b border-slate-100 px-5 py-4 text-xs font-medium uppercase tracking-[0.24em] text-slate-500 md:grid'>
          <span className='inline-flex items-center gap-2'>
            <UserRound className='h-3.5 w-3.5' />
            Paciente
          </span>
          <span className='inline-flex items-center gap-2'>
            <Stethoscope className='h-3.5 w-3.5' />
            Especialista
          </span>
          <span>Estado</span>
          <span>Fecha</span>
          <span />
        </div>

        <div className='divide-y divide-slate-100'>
          {casosVisibles.map((caso) => (
            <Link
              key={caso.id}
              to={`/casos/${caso.id}`}
              className='grid gap-3 px-5 py-4 transition hover:bg-sky-50 md:grid-cols-[1.1fr_1.1fr_0.9fr_0.9fr_32px] md:items-center'
            >
              <div>
                <p className='text-xs font-medium uppercase tracking-[0.24em] text-slate-500 md:hidden'>
                  Paciente
                </p>
                <p className='text-sm font-medium text-slate-950'>
                  {caso.pacienteNombre}
                </p>
              </div>

              <div>
                <p className='text-xs font-medium uppercase tracking-[0.24em] text-slate-500 md:hidden'>
                  Especialista
                </p>
                <p className='text-sm font-medium text-slate-950'>
                  {caso.especialistaNombre}
                </p>
              </div>

              <div>
                <p className='text-xs font-medium uppercase tracking-[0.24em] text-slate-500 md:hidden'>
                  Estado
                </p>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${caso.estadoColor}`}
                >
                  {caso.estadoLabel}
                </span>
              </div>

              <div>
                <p className='text-xs font-medium uppercase tracking-[0.24em] text-slate-500 md:hidden'>
                  Fecha
                </p>
                <p className='text-sm text-slate-600'>
                  {caso.creado.toLocaleDateString('es-ES')}
                </p>
              </div>

              <div className='hidden justify-end md:flex'>
                <ArrowRight className='h-4 w-4 text-sky-700' />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

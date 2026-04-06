import {
  ArrowLeft,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  LoaderCircle,
  Microscope,
  NotebookText,
  Stethoscope,
  UserRound,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { useCasoDetalle } from '@/features/casos/hooks/useCasoDetalle';

export const CasoDetallePage = () => {
  const { id } = useParams();
  const { data, error, isLoading } = useCasoDetalle(id ?? '');

  if (!id) {
    return (
      <div className='rounded-[28px] border border-amber-200 bg-white/85 p-6 text-amber-800 shadow-[0_24px_60px_-40px_rgba(245,158,11,0.45)] backdrop-blur'>
        No se ha indicado el identificador del caso.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='rounded-[28px] border border-sky-100 bg-white/85 p-6 shadow-[0_24px_60px_-40px_rgba(14,165,233,0.65)] backdrop-blur'>
        <div className='inline-flex items-center gap-3 text-sm font-medium text-sky-700'>
          <LoaderCircle className='h-4 w-4 animate-spin' />
          Cargando detalle del caso...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='space-y-3 rounded-[28px] border border-red-200 bg-white/85 p-6 text-red-700 shadow-[0_24px_60px_-40px_rgba(239,68,68,0.45)] backdrop-blur'>
        <p>No se pudo cargar el detalle del caso.</p>
        <Link
          to='/casos'
          className='inline-flex items-center gap-2 text-sm font-medium underline'
        >
          <ArrowLeft className='h-4 w-4' />
          Volver al listado
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className='space-y-3 rounded-[28px] border border-sky-100 bg-white/85 p-6 shadow-[0_24px_60px_-40px_rgba(14,165,233,0.45)] backdrop-blur'>
        <p>No se ha encontrado informacion para este caso.</p>
        <Link
          to='/casos'
          className='inline-flex items-center gap-2 text-sm font-medium underline'
        >
          <ArrowLeft className='h-4 w-4' />
          Volver al listado
        </Link>
      </div>
    );
  }

  const ultimaRevision =
    data.diagnosticos[data.diagnosticos.length - 1]?.creado ?? data.creado;

  const resumenCards = [
    {
      label: 'Caso',
      value: data.id,
      icon: ClipboardCheck,
    },
    {
      label: 'Creado',
      value: data.creado.toLocaleDateString('es-ES'),
      icon: CalendarDays,
    },
    {
      label: 'Diagnosticos',
      value: data.diagnosticos.length,
      icon: NotebookText,
    },
  ];

  return (
    <div className='space-y-6'>
      <section className='relative overflow-hidden rounded-4xl border border-sky-200/70 bg-[linear-gradient(135deg,#f0fdff_0%,#eff6ff_45%,#ffffff_100%)] p-6 shadow-[0_30px_90px_-55px_rgba(14,165,233,0.8)] sm:p-8'>
        <div className='absolute right-0 top-0 h-40 w-40 -translate-y-14 translate-x-12 rounded-full bg-sky-200/60 blur-3xl' />

        <div className='relative space-y-6'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
            <div className='space-y-4'>
              <Link
                to='/casos'
                className='inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.7)] transition hover:border-sky-200 hover:text-sky-700'
              >
                <ArrowLeft className='h-4 w-4' />
                Volver a casos
              </Link>

              <div>
                <p className='text-xs font-medium uppercase tracking-[0.28em] text-sky-700'>
                  Caso
                </p>
                <h1 className='mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl'>
                  Detalle del caso #{data.id}
                </h1>
                <p className='mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base'>
                  Consulta los datos del paciente, el especialista y los
                  diagnosticos registrados para este caso.
                </p>
              </div>
            </div>

            <span
              className={`inline-flex rounded-full px-4 py-2 text-sm font-medium ${data.estadoColor}`}
            >
              {data.estadoLabel}
            </span>
          </div>

          <div className='grid gap-4 md:grid-cols-3'>
            {resumenCards.map((card) => (
              <article
                key={card.label}
                className='rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.24)] backdrop-blur'
              >
                <div className='flex items-center justify-between gap-3'>
                  <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700'>
                    <card.icon className='h-5 w-5' />
                  </div>
                  <p className='text-right text-sm font-medium text-slate-500'>
                    {card.label}
                  </p>
                </div>
                <p className='mt-4 text-2xl font-semibold tracking-tight text-slate-950'>
                  {card.value}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className='grid gap-4 xl:grid-cols-[1.1fr_1.1fr_0.9fr]'>
        <article className='rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.28)] backdrop-blur'>
          <div className='inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.28em] text-slate-500'>
            <UserRound className='h-3.5 w-3.5 text-sky-700' />
            Paciente
          </div>
          <p className='mt-4 text-xl font-semibold text-slate-950'>
            {data.paciente.nombreCompleto}
          </p>
          <p className='mt-2 text-sm text-slate-600'>
            Identificador {data.paciente.id}
          </p>
        </article>

        <article className='rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.28)] backdrop-blur'>
          <div className='inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.28em] text-slate-500'>
            <Stethoscope className='h-3.5 w-3.5 text-sky-700' />
            Especialista responsable
          </div>
          <p className='mt-4 text-xl font-semibold text-slate-950'>
            {data.especialista.nombreCompleto}
          </p>
          <p className='mt-2 text-sm text-slate-600'>
            Identificador {data.especialista.id}
          </p>
        </article>

        <article className='rounded-[28px] border border-white/10 bg-slate-950 p-5 text-white shadow-[0_24px_60px_-42px_rgba(15,23,42,0.6)]'>
          <div className='inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.28em] text-cyan-200/80'>
            <Microscope className='h-3.5 w-3.5' />
            Ultimo diagnostico
          </div>
          <p className='mt-4 text-lg font-semibold'>
            {data.diagnosticos.length
              ? ultimaRevision.toLocaleDateString('es-ES')
              : 'Sin diagnosticos'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-300'>
            {data.diagnosticos.length
              ? 'Fecha del ultimo diagnostico registrado.'
              : 'Todavia no hay diagnosticos asociados a este caso.'}
          </p>
        </article>
      </section>

      <section className='space-y-4'>
        <div>
          <p className='text-xs font-medium uppercase tracking-[0.28em] text-sky-700'>
            Diagnosticos
          </p>
          <h2 className='mt-2 text-2xl font-semibold tracking-tight text-slate-950'>
            Diagnosticos registrados
          </h2>
        </div>

        {data.diagnosticos.length ? (
          <div className='space-y-4'>
            {data.diagnosticos.map((diagnostico, index) => (
              <article
                key={diagnostico.id}
                className='rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.24)] backdrop-blur'
              >
                <div className='flex flex-col gap-4 md:flex-row md:items-start'>
                  <div className='flex items-center gap-3 md:w-60 md:flex-col md:items-start md:pr-4'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700'>
                      <ClipboardList className='h-5 w-5' />
                    </div>
                    <div>
                      <p className='text-xs font-medium uppercase tracking-[0.28em] text-slate-500'>
                        Nota {index + 1}
                      </p>
                      <p className='mt-2 text-sm font-medium text-slate-900'>
                        {diagnostico.creado.toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>

                  <div className='min-w-0 flex-1 border-l border-slate-100 pl-0 md:pl-6'>
                    <p className='text-sm leading-7 text-slate-700'>
                      {diagnostico.nota}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className='rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.24)] backdrop-blur'>
            <div className='inline-flex items-center gap-3 text-sm font-medium text-slate-700'>
              <Microscope className='h-4 w-4 text-sky-700' />
              Este caso no tiene diagnosticos todavia.
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

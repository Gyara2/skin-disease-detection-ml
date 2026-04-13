import { ArrowRight, ImageIcon, LoaderCircle, Microscope, Stethoscope, UserRound } from 'lucide-react';
import type { FormEvent } from 'react';

import { CustomSelect } from '@/shared/components/CustomSelect';
import type { CasoDetalle, Diagnostico } from '@/shared/types';

import type { SelectOption } from './caso-detalle-sections.types';

interface CasoDetalleResumenSectionProps {
  data: CasoDetalle;
  ultimoDiagnostico: Diagnostico | null;
  puedeGestionarCaso: boolean;
  estadoSeleccionado: string;
  estadoCasoOptions: SelectOption[];
  onEstadoSeleccionadoChange: (value: string) => void;
  onActualizarEstado: (event: FormEvent<HTMLFormElement>) => void;
  isActualizandoEstado: boolean;
  estadoFeedback: string | null;
}

export const CasoDetalleResumenSection = ({
  data,
  ultimoDiagnostico,
  puedeGestionarCaso,
  estadoSeleccionado,
  estadoCasoOptions,
  onEstadoSeleccionadoChange,
  onActualizarEstado,
  isActualizandoEstado,
  estadoFeedback,
}: CasoDetalleResumenSectionProps) => {
  return (
    <section id='resumen-caso' className='space-y-4'>
      <div>
        <p className='text-xs font-medium uppercase tracking-[0.28em] text-sky-700'>
          Resumen del caso
        </p>
        <h2 className='mt-2 text-2xl font-semibold tracking-tight text-slate-950'>
          Contexto clínico y seguimiento
        </h2>
      </div>

      <div className='grid gap-4 xl:grid-cols-[1.05fr_1.05fr_0.9fr_1.2fr]'>
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
            Última imagen
          </div>

          <div className='mt-4 overflow-hidden rounded-[24px] border border-white/10 bg-white/5 shadow-[0_24px_50px_-40px_rgba(15,23,42,0.7)]'>
            {ultimoDiagnostico?.imagen?.src ? (
              <img
                src={ultimoDiagnostico.imagen.src}
                alt={`Última imagen del caso ${data.id}`}
                className='aspect-[4/3] w-full object-cover'
              />
            ) : (
              <div className='flex aspect-[4/3] items-center justify-center bg-white/[0.03] text-slate-500'>
                <ImageIcon className='h-9 w-9' />
              </div>
            )}
          </div>

          <p className='mt-4 text-lg font-semibold'>
            {ultimoDiagnostico?.imagenId ?? 'Sin imagen registrada'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-300'>
            {ultimoDiagnostico
              ? `Última captura añadida el ${ultimoDiagnostico.creado.toLocaleDateString('es-ES')}.`
              : 'Este caso todavía no tiene imágenes asociadas.'}
          </p>
          <p className='mt-3 text-xs uppercase tracking-[0.24em] text-cyan-200/70'>
            {ultimoDiagnostico
              ? 'Imagen más reciente del caso'
              : 'Sin preview disponible'}
          </p>
        </article>

        <article className='rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.28)] backdrop-blur'>
          <div className='space-y-2'>
            <p className='text-xs font-medium uppercase tracking-[0.28em] text-sky-700'>
              Estado del caso
            </p>
            <h2 className='text-xl font-semibold tracking-tight text-slate-950'>
              {puedeGestionarCaso
                ? 'Gestionar seguimiento'
                : 'Seguimiento actual'}
            </h2>
            <p className='text-sm leading-6 text-slate-600'>
              Estado operativo del caso durante el circuito clínico.
            </p>
          </div>

          {puedeGestionarCaso ? (
            <form className='mt-5 space-y-4' onSubmit={onActualizarEstado}>
              <CustomSelect
                label='Estado'
                value={estadoSeleccionado}
                onChange={onEstadoSeleccionadoChange}
                options={estadoCasoOptions}
                disabled={isActualizandoEstado}
                containerClassName='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'
                menuClassName='sm:max-h-72'
              />

              {estadoFeedback ? (
                <div className='rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800'>
                  {estadoFeedback}
                </div>
              ) : null}

              <button
                type='submit'
                disabled={isActualizandoEstado}
                className='inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300'
              >
                {isActualizandoEstado ? (
                  <>
                    <LoaderCircle className='h-4 w-4 animate-spin' />
                    Guardando...
                  </>
                ) : (
                  <>
                    Guardar estado
                    <ArrowRight className='h-4 w-4' />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className='mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700'>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${data.estadoColor}`}
              >
                {data.estadoLabel}
              </span>
              <p className='mt-3 leading-6'>
                Solo el especialista responsable y administración pueden
                actualizar este estado.
              </p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
};

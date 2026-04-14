import { LoaderCircle, RefreshCcw } from 'lucide-react';
import type { FormEvent } from 'react';

import { CustomSelect } from '@/shared/components/CustomSelect';
import type { Diagnostico, PrediccionCaso } from '@/shared/types';
import { HistoryShortcut, MetricPill, PredictionPanel } from './CasoDetalleShared';

interface Option {
  value: string;
  label: string;
}

interface CasoDetalleAnalisisViewProps {
  diagnosticos: Diagnostico[];
  ultimaPrediccion: PrediccionCaso | null;
  predicciones: PrediccionCaso[];
  diagnosticoOptions: Option[];
  prediccionOptions: Option[];
  validacionDiagnosticoId: string;
  validacionPrediccionId: string;
  validacionConclusion: string;
  analisisFeedback: string | null;
  isFetching: boolean;
  isSubmitting: boolean;
  onRefresh: () => void;
  onSubmitValidacion: (event: FormEvent<HTMLFormElement>) => void;
  onDiagnosticoChange: (value: string) => void;
  onPrediccionChange: (value: string) => void;
  onConclusionChange: (value: string) => void;
}

export const CasoDetalleAnalisisView = ({
  diagnosticos,
  ultimaPrediccion,
  predicciones,
  diagnosticoOptions,
  prediccionOptions,
  validacionDiagnosticoId,
  validacionPrediccionId,
  validacionConclusion,
  analisisFeedback,
  isFetching,
  isSubmitting,
  onRefresh,
  onSubmitValidacion,
  onDiagnosticoChange,
  onPrediccionChange,
  onConclusionChange,
}: CasoDetalleAnalisisViewProps) => (
  <div className='space-y-4'>
    <div className='grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]'>
      <div className='space-y-6'>
        <article className='rounded-3xl border border-amber-200 bg-amber-50 p-5'>
          <h3 className='text-lg font-bold text-amber-900'>
            Análisis IA como apoyo clínico
          </h3>
          <p className='mt-2 text-sm leading-relaxed text-amber-800'>
            La predicción automática es orientativa. El especialista
            responsable mantiene la decisión final del diagnóstico y de la
            validación clínica.
          </p>
          <button
            type='button'
            onClick={onRefresh}
            disabled={isFetching}
            className='mt-4 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-amber-100 px-4 py-2 text-xs font-semibold text-amber-900 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60'
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Consultando...' : 'Consultar predicción ahora'}
          </button>
        </article>

        <PredictionPanel prediction={ultimaPrediccion} />

        <article className='rounded-3xl border border-slate-200 bg-white p-6'>
          <h3 className='text-base font-bold text-slate-900'>
            Estado de predicciones
          </h3>
          <div className='mt-4 grid gap-3 sm:grid-cols-3'>
            <MetricPill label='Total' value={String(predicciones.length)} />
            <MetricPill
              label='Disponibles'
              value={String(predicciones.filter((item) => item.estado === 'lista').length)}
            />
            <MetricPill
              label='Pendientes/Error'
              value={String(predicciones.filter((item) => item.estado !== 'lista').length)}
            />
          </div>
        </article>
      </div>

      <article className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
        <h3 className='text-lg font-bold text-slate-900'>
          Validación clínica
        </h3>
        <p className='mt-2 text-sm leading-relaxed text-slate-500'>
          Registra aquí la conclusión del especialista sobre una predicción
          disponible.
        </p>

        {diagnosticoOptions.length ? (
          <form className='mt-5 space-y-4' onSubmit={onSubmitValidacion}>
            <CustomSelect
              label='Diagnóstico'
              value={validacionDiagnosticoId}
              onChange={onDiagnosticoChange}
              options={diagnosticoOptions}
              disabled={isSubmitting}
              containerClassName='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'
            />

            <CustomSelect
              label='Predicción disponible'
              value={validacionPrediccionId}
              onChange={onPrediccionChange}
              options={prediccionOptions}
              disabled={isSubmitting || !prediccionOptions.length}
              containerClassName='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'
            />

            <label className='block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'>
              <span className='block text-xs font-medium uppercase tracking-[0.24em] text-slate-500'>
                Conclusión clínica breve
              </span>
              <textarea
                value={validacionConclusion}
                onChange={(event) => onConclusionChange(event.target.value)}
                rows={4}
                placeholder='Escribe una breve conclusión clínica del especialista...'
                className='mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-300'
                disabled={isSubmitting}
                required
              />
            </label>

            {analisisFeedback ? (
              <p className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'>
                {analisisFeedback}
              </p>
            ) : null}

            <button
              type='submit'
              disabled={isSubmitting}
              className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300'
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className='h-4 w-4 animate-spin' />
                  Guardando validación...
                </>
              ) : (
                'Guardar validación clínica'
              )}
            </button>
          </form>
        ) : (
          <div className='mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600'>
            No hay predicciones listas para validar todavía. Puedes seguir
            en Gestión Médica y registrar un nuevo diagnóstico para
            generar una nueva predicción. Cuando la IA termine, usa el
            botón Consultar predicción ahora.
          </div>
        )}
      </article>
    </div>
    <HistoryShortcut diagnosticos={diagnosticos} />
  </div>
);

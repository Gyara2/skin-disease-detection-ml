import { Lock, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import type { Diagnostico, PrediccionCaso } from '@/shared/types';

export const InfoCard = ({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
}) => (
  <div className='rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md'>
    <div className='mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400'>
      {icon}
    </div>
    <p className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
      {title}
    </p>
    <p className='mt-1 text-lg font-bold text-slate-900'>{value}</p>
  </div>
);

export const PredictionPanel = ({
  prediction,
}: {
  prediction: PrediccionCaso | null;
}) => (
  <div className='rounded-3xl border border-slate-200 bg-white p-8 shadow-sm'>
    <div className='mb-6 flex items-center gap-3'>
      <div className='rounded-lg bg-amber-50 p-2'>
        <Sparkles className='h-5 w-5 text-amber-600' />
      </div>
      <h3 className='text-xl font-bold text-slate-900'>
        Predicción del sistema
      </h3>
    </div>

    {prediction ? (
      <div className='space-y-6'>
        <div className='rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600'>
          <p>
            Estado:{' '}
            <span className='font-semibold text-slate-900'>
              {prediction.estado}
            </span>
          </p>
          <p className='mt-1'>
            Modelo:{' '}
            <span className='font-semibold text-slate-900'>
              {prediction.modelo ?? 'N/D'}
            </span>
          </p>
          <p className='mt-1'>
            Fecha:{' '}
            <span className='font-semibold text-slate-900'>
              {prediction.creado?.toLocaleString() ?? 'Sin fecha'}
            </span>
          </p>
          {prediction.resumen ? (
            <p className='mt-3'>{prediction.resumen}</p>
          ) : null}
        </div>

        {prediction.probabilidades.length ? (
          prediction.probabilidades.map((probabilidad, index) => (
            <div key={`${probabilidad.etiqueta}-${index}`} className='group'>
              <div className='mb-2 flex justify-between text-sm font-bold'>
                <span className='text-slate-700'>{probabilidad.etiqueta}</span>
                <span className='text-sky-600'>
                  {probabilidad.porcentaje.toFixed(1)}%
                </span>
              </div>
              <div className='h-3 overflow-hidden rounded-full bg-slate-100'>
                <div
                  className={`h-full transition-all duration-1000 ${
                    index === 0 ? 'bg-sky-500' : 'bg-slate-300'
                  }`}
                  style={{ width: `${probabilidad.porcentaje}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className='rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600'>
            La IA todavía no ha devuelto probabilidades para este registro.
          </div>
        )}
      </div>
    ) : (
      <div className='flex flex-col items-center py-10 text-slate-400'>
        <Lock className='mb-2 h-8 w-8 opacity-20' />
        <p className='text-sm font-medium'>
          No hay análisis disponibles para este caso en este momento.
        </p>
      </div>
    )}
  </div>
);

export const MetricPill = ({ label, value }: { label: string; value: string }) => (
  <div className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
    <p className='text-xs font-bold uppercase tracking-widest text-slate-500'>
      {label}
    </p>
    <p className='mt-2 text-2xl font-black text-slate-900'>{value}</p>
  </div>
);

export const HistoryShortcut = ({ diagnosticos }: { diagnosticos: Diagnostico[] }) => (
  <article className='rounded-3xl border border-slate-200 bg-white p-5 shadow-sm'>
    <div className='flex items-center justify-between gap-3'>
      <div>
        <p className='text-xs font-bold uppercase tracking-widest text-slate-500'>
          Diagnósticos realizados
        </p>
        <p className='mt-1 text-sm text-slate-600'>
          Puedes ver el detalle completo en la pestaña General.
        </p>
      </div>
      <Link
        to='../resumen'
        relative='path'
        className='rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50'
      >
        Ver diagnósticos
      </Link>
    </div>

    <div className='mt-4 space-y-2'>
      {diagnosticos.slice(0, 3).map((diagnostico, index) => (
        <div
          key={diagnostico.id}
          className='rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700'
        >
          <span className='font-semibold text-slate-900'>
            Entrada #{diagnosticos.length - index}
          </span>{' '}
          - {diagnostico.creado?.toLocaleDateString() ?? 'Sin fecha'}
        </div>
      ))}
    </div>
  </article>
);

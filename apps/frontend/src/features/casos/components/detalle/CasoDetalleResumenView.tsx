import { CalendarDays, ImageIcon, Microscope, NotebookText, Stethoscope } from 'lucide-react';

import { InfoCard } from './CasoDetalleShared';
import type { CasoDetalle, Diagnostico } from '@/shared/types';

interface CasoDetalleResumenViewProps {
  data: CasoDetalle;
  diagnosticos: Diagnostico[];
  ultimoDiagnostico: Diagnostico | null;
}

export const CasoDetalleResumenView = ({
  data,
  diagnosticos,
  ultimoDiagnostico,
}: CasoDetalleResumenViewProps) => (
  <div className='space-y-6'>
    <section className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      <InfoCard
        icon={<Stethoscope />}
        title='Especialista'
        value={data.especialista.nombreCompleto}
      />
      <InfoCard
        icon={<CalendarDays />}
        title='Apertura'
        value={data.creado.toLocaleDateString()}
      />
      <InfoCard
        icon={<NotebookText />}
        title='Evolución'
        value={`${data.diagnosticos.length} diagnósticos`}
      />
    </section>

    <section className='grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]'>
      <div className='space-y-4'>
        <h3 className='px-2 text-lg font-bold text-slate-800'>
          Diagnósticos realizados
        </h3>
        {diagnosticos.map((diagnostico, index) => (
          <div
            key={diagnostico.id}
            className='group flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:border-sky-200'
          >
            <div className='relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100'>
              {diagnostico.imagen?.src ? (
                <img
                  src={diagnostico.imagen.src}
                  className='h-full w-full object-cover'
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center'>
                  <ImageIcon className='h-6 w-6 text-slate-300' />
                </div>
              )}
            </div>
            <div className='flex min-w-0 flex-1 flex-col justify-center'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <span className='text-[10px] font-bold uppercase tracking-widest text-sky-600'>
                  Entrada #{diagnosticos.length - index}
                </span>
                <p className='text-sm text-slate-500'>
                  {diagnostico.creado?.toLocaleDateString() ?? 'Sin fecha'}
                </p>
              </div>
              <p className='mt-1 line-clamp-1 font-medium text-slate-700'>
                {diagnostico.nota}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className='rounded-[32px] bg-slate-900 p-6 text-white shadow-2xl xl:sticky xl:top-6 xl:h-fit'>
        <div className='mb-6 flex items-center justify-between'>
          <span className='text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400'>
            Última captura
          </span>
          <Microscope className='h-4 w-4 text-cyan-400' />
        </div>
        <div className='mb-4 aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/5'>
          {ultimoDiagnostico?.imagen?.src ? (
            <img
              src={ultimoDiagnostico.imagen.src}
              className='h-full w-full object-cover'
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center'>
              <ImageIcon className='h-8 w-8 text-slate-700' />
            </div>
          )}
        </div>
        <p className='text-sm italic leading-relaxed text-slate-300'>
          {ultimoDiagnostico?.nota || 'Sin anotaciones recientes.'}
        </p>
      </div>
    </section>
  </div>
);

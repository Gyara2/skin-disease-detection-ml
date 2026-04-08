import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { CasoDetalle } from '@/shared/types';

import type {
  CasoResumenCard,
  SeccionNavegacion,
} from './caso-detalle-sections.types';

interface CasoDetalleHeroSectionProps {
  data: CasoDetalle;
  resumenCards: CasoResumenCard[];
  seccionesNavegacion: SeccionNavegacion[];
}

export const CasoDetalleHeroSection = ({
  data,
  resumenCards,
  seccionesNavegacion,
}: CasoDetalleHeroSectionProps) => {
  return (
    <>
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
                  El caso agrupa las distintas imágenes, anotaciones clínicas,
                  predicciones y validaciones registradas durante el
                  seguimiento.
                </p>
              </div>
            </div>

            <span
              className={`inline-flex rounded-full px-4 py-2 text-sm font-medium ${data.estadoColor}`}
            >
              {data.estadoLabel}
            </span>
          </div>

          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
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

      <nav className='flex flex-wrap gap-2'>
        {seccionesNavegacion.map((seccion) => (
          <a
            key={seccion.id}
            href={`#${seccion.id}`}
            className='inline-flex items-center rounded-full border border-sky-100 bg-white/85 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-600 transition hover:border-sky-300 hover:text-sky-700'
          >
            {seccion.label}
          </a>
        ))}
      </nav>
    </>
  );
};

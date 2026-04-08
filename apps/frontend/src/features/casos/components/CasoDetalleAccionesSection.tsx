import { ArrowRight, LoaderCircle } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';

import { CustomSelect } from '@/shared/components/CustomSelect';

import type { SelectOption } from './caso-detalle-sections.types';

interface CasoDetalleAccionesSectionProps {
  mostrarSeccionAcciones: boolean;
  puedeRegistrarValidacion: boolean;
  puedeCrearDiagnostico: boolean;
  prediccionValidacionOptions: SelectOption[];
  prediccionValidacionSeleccionada: string;
  onPrediccionValidacionChange: (value: string) => void;
  resultadoClinicoOptions: SelectOption[];
  resultadoValidacion: string;
  onResultadoValidacionChange: (value: string) => void;
  notaValidacion: string;
  onNotaValidacionChange: (value: string) => void;
  onCrearValidacion: (event: FormEvent<HTMLFormElement>) => void;
  isCreandoValidacion: boolean;
  validacionFeedback: string | null;
  diagnosticImageUploadField: ReactNode;
  notaDiagnostico: string;
  onNotaDiagnosticoChange: (value: string) => void;
  onCrearDiagnostico: (event: FormEvent<HTMLFormElement>) => void;
  isCreandoDiagnostico: boolean;
  diagnosticoFeedback: string | null;
}

export const CasoDetalleAccionesSection = ({
  mostrarSeccionAcciones,
  puedeRegistrarValidacion,
  puedeCrearDiagnostico,
  prediccionValidacionOptions,
  prediccionValidacionSeleccionada,
  onPrediccionValidacionChange,
  resultadoClinicoOptions,
  resultadoValidacion,
  onResultadoValidacionChange,
  notaValidacion,
  onNotaValidacionChange,
  onCrearValidacion,
  isCreandoValidacion,
  validacionFeedback,
  diagnosticImageUploadField,
  notaDiagnostico,
  onNotaDiagnosticoChange,
  onCrearDiagnostico,
  isCreandoDiagnostico,
  diagnosticoFeedback,
}: CasoDetalleAccionesSectionProps) => {
  if (!mostrarSeccionAcciones) {
    return null;
  }

  return (
    <section id='acciones-caso' className='space-y-4'>
      <div>
        <p className='text-xs font-medium uppercase tracking-[0.28em] text-sky-700'>
          Acciones clínicas
        </p>
        <h2 className='mt-2 text-2xl font-semibold tracking-tight text-slate-950'>
          Operaciones del especialista
        </h2>
      </div>

      <div className='grid gap-4 xl:grid-cols-[0.95fr_1.05fr]'>
        {puedeRegistrarValidacion ? (
          <article className='rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.28)] backdrop-blur'>
            <div className='space-y-2'>
              <p className='text-xs font-medium uppercase tracking-[0.28em] text-sky-700'>
              Validación clínica
              </p>
              <h2 className='text-xl font-semibold tracking-tight text-slate-950'>
                Registrar diagnóstico final
              </h2>
              <p className='text-sm leading-6 text-slate-600'>
                Esta acción la realiza el especialista responsable sobre una
                predicción disponible para dejar constancia del diagnóstico
                final.
              </p>
            </div>

            {prediccionValidacionOptions.length ? (
              <form className='mt-5 space-y-4' onSubmit={onCrearValidacion}>
                <CustomSelect
                  label='Predicción a validar'
                  value={prediccionValidacionSeleccionada}
                  onChange={onPrediccionValidacionChange}
                  options={prediccionValidacionOptions}
                  disabled={isCreandoValidacion}
                  containerClassName='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'
                />

                <CustomSelect
                  label='Diagnóstico final'
                  value={resultadoValidacion}
                  onChange={onResultadoValidacionChange}
                  options={resultadoClinicoOptions}
                  disabled={isCreandoValidacion}
                  containerClassName='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'
                  placeholder='Selecciona el diagnóstico final del especialista'
                />

                <label className='block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'>
                  <span className='block text-xs font-medium uppercase tracking-[0.24em] text-slate-500'>
                    Nota del diagnóstico final
                  </span>
                  <textarea
                    value={notaValidacion}
                    onChange={(event) => onNotaValidacionChange(event.target.value)}
                    rows={4}
                    placeholder='Añade observaciones clínicas que justifiquen el diagnóstico final.'
                    className='mt-2 w-full resize-none bg-transparent text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400'
                    disabled={isCreandoValidacion}
                  />
                </label>

                {validacionFeedback ? (
                  <div className='rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800'>
                    {validacionFeedback}
                  </div>
                ) : null}

                <button
                  type='submit'
                  disabled={isCreandoValidacion}
                  className='inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300'
                >
                  {isCreandoValidacion ? (
                    <>
                      <LoaderCircle className='h-4 w-4 animate-spin' />
                      Registrando...
                    </>
                  ) : (
                    <>
                      Registrar diagnóstico final
                      <ArrowRight className='h-4 w-4' />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className='mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700'>
                No hay predicciones disponibles para validar todavía.
              </div>
            )}
          </article>
        ) : null}

        {puedeCrearDiagnostico ? (
          <article className='rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.28)] backdrop-blur'>
            <div className='space-y-2'>
              <p className='text-xs font-medium uppercase tracking-[0.28em] text-sky-700'>
                Nueva anotación clínica
              </p>
              <h2 className='text-xl font-semibold tracking-tight text-slate-950'>
                Añadir imagen y anotación
              </h2>
              <p className='text-sm leading-6 text-slate-600'>
                Un mismo caso puede acumular varias imágenes. Cada nuevo
                registro clínico añade otra captura y dispara su propia
                predicción automática.
              </p>
            </div>

            <form className='mt-5 space-y-4' onSubmit={onCrearDiagnostico}>
              {diagnosticImageUploadField}

              <label className='block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'>
                <span className='block text-xs font-medium uppercase tracking-[0.24em] text-slate-500'>
                  Anotación clínica
                </span>
                <textarea
                  value={notaDiagnostico}
                  onChange={(event) => onNotaDiagnosticoChange(event.target.value)}
                  rows={5}
                  placeholder='Describe hallazgos, observaciones o recomendaciones clínicas.'
                  className='mt-2 w-full resize-none bg-transparent text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400'
                  disabled={isCreandoDiagnostico}
                />
              </label>

              {diagnosticoFeedback ? (
                <div className='rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800'>
                  {diagnosticoFeedback}
                </div>
              ) : null}

              <button
                type='submit'
                disabled={isCreandoDiagnostico}
                className='inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300'
              >
                {isCreandoDiagnostico ? (
                  <>
                    <LoaderCircle className='h-4 w-4 animate-spin' />
                    Registrando...
                  </>
                ) : (
                  <>
                    Registrar anotación clínica
                    <ArrowRight className='h-4 w-4' />
                  </>
                )}
              </button>
            </form>
          </article>
        ) : null}
      </div>
    </section>
  );
};

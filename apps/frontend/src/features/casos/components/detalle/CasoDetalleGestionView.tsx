import { ImageIcon, LoaderCircle, Settings2 } from 'lucide-react';
import type { ChangeEvent, FormEvent } from 'react';

import { CustomSelect } from '@/shared/components/CustomSelect';
import type { Diagnostico, EstadoCaso } from '@/shared/types';
import { HistoryShortcut } from './CasoDetalleShared';

interface Option {
  value: string;
  label: string;
}

interface CasoDetalleGestionViewProps {
  diagnosticos: Diagnostico[];
  estadoSeleccionado: EstadoCaso;
  estadoOptions: Option[];
  diagnosticoNota: string;
  diagnosticoImagenBase64: string;
  diagnosticoImagenNombre: string;
  diagnosticoImagenFeedback: string | null;
  gestionFeedback: string | null;
  isSavingEstado: boolean;
  isSavingDiagnostico: boolean;
  onSubmitEstado: (event: FormEvent<HTMLFormElement>) => void;
  onEstadoChange: (value: EstadoCaso) => void;
  onSubmitDiagnostico: (event: FormEvent<HTMLFormElement>) => void;
  onDiagnosticoNotaChange: (value: string) => void;
  onDiagnosticoImagenChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const CasoDetalleGestionView = ({
  diagnosticos,
  estadoSeleccionado,
  estadoOptions,
  diagnosticoNota,
  diagnosticoImagenBase64,
  diagnosticoImagenNombre,
  diagnosticoImagenFeedback,
  gestionFeedback,
  isSavingEstado,
  isSavingDiagnostico,
  onSubmitEstado,
  onEstadoChange,
  onSubmitDiagnostico,
  onDiagnosticoNotaChange,
  onDiagnosticoImagenChange,
}: CasoDetalleGestionViewProps) => (
  <div className='space-y-4'>
    <div className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'>
      <article className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
        <h2 className='flex items-center gap-2 text-xl font-bold text-slate-900'>
          <Settings2 className='h-5 w-5 text-sky-600' /> Gestión del caso
        </h2>
        <p className='mt-2 text-sm leading-relaxed text-slate-500'>
          El especialista puede avanzar el flujo del caso y registrar
          nuevos hallazgos. Para cerrar el caso en "completado" debe
          existir al menos una validación clínica.
        </p>

        <form className='mt-5 space-y-4' onSubmit={onSubmitEstado}>
          <CustomSelect
            label='Estado del caso'
            value={estadoSeleccionado}
            onChange={(value) => onEstadoChange(value as EstadoCaso)}
            options={estadoOptions}
            disabled={isSavingEstado}
            containerClassName='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'
          />

          <button
            type='submit'
            disabled={isSavingEstado}
            className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300'
          >
            {isSavingEstado ? (
              <>
                <LoaderCircle className='h-4 w-4 animate-spin' />
                Guardando estado...
              </>
            ) : (
              'Guardar estado'
            )}
          </button>
        </form>
      </article>

      <article className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
        <h3 className='text-lg font-bold text-slate-900'>
          Registrar diagnóstico
        </h3>
        <p className='mt-2 text-sm leading-relaxed text-slate-500'>
          Adjunta una nueva imagen y la nota clínica. La IA puede
          responder al momento o quedar pendiente; su salida es apoyo, no
          sustituto.
        </p>

        <form className='mt-5 space-y-4' onSubmit={onSubmitDiagnostico}>
          <label className='block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'>
            <span className='block text-xs font-medium uppercase tracking-[0.24em] text-slate-500'>
              Imagen clínica
            </span>
            <input
              type='file'
              accept='image/*'
              onChange={onDiagnosticoImagenChange}
              className='mt-2 w-full text-sm text-slate-900 file:mr-3 file:rounded-2xl file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800'
              disabled={isSavingDiagnostico}
            />
            <div className='mt-3 flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white p-3'>
              <div className='flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100'>
                {diagnosticoImagenBase64 ? (
                  <img
                    src={diagnosticoImagenBase64}
                    alt={diagnosticoImagenNombre || 'Previsualización de imagen clínica'}
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <ImageIcon className='h-6 w-6 text-slate-300' />
                )}
              </div>
              <p className='text-xs leading-relaxed text-slate-500'>
                {diagnosticoImagenBase64
                  ? 'Previsualización lista. Verifica calidad y enfoque antes de guardar el diagnóstico.'
                  : 'La previsualización aparecerá aquí cuando selecciones una imagen válida.'}
              </p>
            </div>

            {diagnosticoImagenFeedback ? (
              <p className='mt-2 text-xs font-medium text-rose-600'>
                {diagnosticoImagenFeedback}
              </p>
            ) : null}
          </label>

          <label className='block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'>
            <span className='block text-xs font-medium uppercase tracking-[0.24em] text-slate-500'>
              Nota clínica
            </span>
            <textarea
              value={diagnosticoNota}
              onChange={(event) => onDiagnosticoNotaChange(event.target.value)}
              rows={4}
              placeholder='Describe hallazgos y criterio clínico...'
              className='mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-300'
              disabled={isSavingDiagnostico}
            />
          </label>

          {gestionFeedback ? (
            <p className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'>
              {gestionFeedback}
            </p>
          ) : null}

          <button
            type='submit'
            disabled={isSavingDiagnostico}
            className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300'
          >
            {isSavingDiagnostico ? (
              <>
                <LoaderCircle className='h-4 w-4 animate-spin' />
                Registrando diagnóstico...
              </>
            ) : (
              'Guardar diagnóstico'
            )}
          </button>
        </form>
      </article>
    </div>
    <HistoryShortcut diagnosticos={diagnosticos} />
  </div>
);

import { ImageIcon, Microscope } from 'lucide-react';

import type {
  Diagnostico,
  EstadoPrediccion,
  EstadoValidacion,
  PrediccionCaso,
  ResultadoClinico,
  ValidacionCaso,
} from '@/shared/types';

import type { EstadoUiItem } from './caso-detalle-sections.types';

interface CasoDetalleRegistrosSectionProps {
  diagnosticosOrdenados: Diagnostico[];
  puedeVerPrediccion: boolean;
  estadoPrediccionUi: Record<EstadoPrediccion, EstadoUiItem>;
  estadoValidacionUi: Record<EstadoValidacion, EstadoUiItem>;
  resultadoClinicoLabel: Record<ResultadoClinico, string>;
  formatPredictionPercentage: (percentage: number) => string;
}

const getUltimaValidacionPrediccion = (
  prediccion: PrediccionCaso,
): ValidacionCaso | null =>
  [...prediccion.validaciones].sort(
    (a, b) => (b.actualizado?.getTime() ?? 0) - (a.actualizado?.getTime() ?? 0),
  )[0] ?? null;

const sortPrediccionesDesc = (predicciones: PrediccionCaso[]) =>
  [...predicciones].sort(
    (a, b) => (b.creado?.getTime() ?? 0) - (a.creado?.getTime() ?? 0),
  );

export const CasoDetalleRegistrosSection = ({
  diagnosticosOrdenados,
  puedeVerPrediccion,
  estadoPrediccionUi,
  estadoValidacionUi,
  resultadoClinicoLabel,
  formatPredictionPercentage,
}: CasoDetalleRegistrosSectionProps) => {
  return (
    <section id='registros-caso' className='space-y-4'>
      <div>
        <p className='text-xs font-medium uppercase tracking-[0.28em] text-sky-700'>
          Registros clínicos
        </p>
        <h2 className='mt-2 text-2xl font-semibold tracking-tight text-slate-950'>
          Historial de anotaciones clínicas
        </h2>
      </div>

      {diagnosticosOrdenados.length ? (
        <div className='space-y-4'>
          {diagnosticosOrdenados.map((diagnostico, index) => {
            const prediccionesDiagnostico = sortPrediccionesDesc(
              diagnostico.predicciones,
            );

            return (
              <article
                key={diagnostico.id}
                className='rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.24)] backdrop-blur'
              >
                <div className='grid gap-5 lg:grid-cols-[220px_1fr]'>
                  <div className='space-y-3'>
                    <div className='overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100'>
                      {diagnostico.imagen?.src ? (
                        <img
                          src={diagnostico.imagen.src}
                          alt={`Imagen del registro clínico ${diagnostico.id}`}
                          className='aspect-[4/3] w-full object-cover'
                        />
                      ) : (
                        <div className='flex aspect-[4/3] items-center justify-center text-slate-400'>
                          <ImageIcon className='h-9 w-9' />
                        </div>
                      )}
                    </div>

                    <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3'>
                      <p className='text-xs font-medium uppercase tracking-[0.24em] text-slate-500'>
                        Registro clínico {index + 1}
                      </p>
                      <p className='mt-2 text-sm font-semibold text-slate-950'>
                        {diagnostico.creado.toLocaleDateString('es-ES')}
                      </p>
                      <p className='mt-1 text-xs uppercase tracking-[0.24em] text-slate-500'>
                        Imagen {diagnostico.imagenId}
                      </p>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4'>
                      <p className='text-xs font-medium uppercase tracking-[0.24em] text-slate-500'>
                      Anotación clínica
                      </p>
                      <p className='mt-3 text-sm leading-7 text-slate-700'>
                        {diagnostico.nota}
                      </p>
                    </div>

                    {puedeVerPrediccion ? (
                      prediccionesDiagnostico.length ? (
                        <div className='space-y-3'>
                          {prediccionesDiagnostico.map((prediccion) => {
                            const estadoPrediccionItem =
                              estadoPrediccionUi[prediccion.estado];
                            const validacionPrediccion =
                              getUltimaValidacionPrediccion(prediccion);
                            const estadoValidacionItem = validacionPrediccion
                              ? estadoValidacionUi[validacionPrediccion.estado]
                              : null;

                            return (
                              <div
                                key={prediccion.id}
                                className='rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-[0_18px_40px_-36px_rgba(15,23,42,0.45)]'
                              >
                                <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                                  <div>
                                    <p className='text-xs font-medium uppercase tracking-[0.24em] text-slate-500'>
                                      Predicción
                                    </p>
                                    <p className='mt-2 text-sm font-semibold text-slate-950'>
                                      {prediccion.modeloVersion ??
                                        prediccion.modelo ??
                                        'Modelo no indicado'}
                                    </p>
                                  </div>
                                  <span
                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${estadoPrediccionItem.badge}`}
                                  >
                                    {estadoPrediccionItem.label}
                                  </span>
                                </div>

                                <div className='mt-4 grid gap-3 sm:grid-cols-3'>
                                  {prediccion.probabilidades.length ? (
                                    prediccion.probabilidades.map((item) => (
                                      <div
                                        key={`${prediccion.id}-${item.etiqueta}`}
                                        className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3'
                                      >
                                        <p className='text-xs font-medium uppercase tracking-[0.24em] text-slate-500'>
                                          {item.etiqueta}
                                        </p>
                                        <p className='mt-2 text-sm font-semibold text-slate-950'>
                                          {formatPredictionPercentage(
                                            item.porcentaje,
                                          )}
                                        </p>
                                      </div>
                                    ))
                                  ) : (
                                    <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:col-span-3'>
                                      <p className='text-sm leading-6 text-slate-700'>
                                        {prediccion.resumen ??
                                          estadoPrediccionItem.description}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <div className='mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'>
                                  <p className='leading-6'>
                                    {prediccion.resumen ??
                                      estadoPrediccionItem.description}
                                  </p>
                                  <p className='mt-3 text-xs uppercase tracking-[0.24em] text-slate-500'>
                                    {prediccion.creado
                                      ? `Generada el ${prediccion.creado.toLocaleDateString('es-ES')}`
                                      : 'Fecha de generación no disponible'}
                                  </p>
                                </div>

                                {validacionPrediccion ? (
                                  <div className='mt-4 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-slate-700'>
                                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                                      <p className='font-medium text-slate-950'>
                                        Validación:{' '}
                                        {validacionPrediccion.resultadoFinal
                                          ? resultadoClinicoLabel[
                                              validacionPrediccion.resultadoFinal
                                            ]
                                          : 'Pendiente'}
                                      </p>
                                      {estadoValidacionItem ? (
                                        <span
                                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${estadoValidacionItem.badge}`}
                                        >
                                          {estadoValidacionItem.label}
                                        </span>
                                      ) : null}
                                    </div>
                                    {validacionPrediccion.nota ? (
                                      <p className='mt-2 leading-6 text-slate-600'>
                                        {validacionPrediccion.nota}
                                      </p>
                                    ) : null}
                                  </div>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700'>
                          Este registro clínico todavía no tiene predicciones
                          asociadas.
                        </div>
                      )
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className='rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.24)] backdrop-blur'>
          <div className='inline-flex items-center gap-3 text-sm font-medium text-slate-700'>
            <Microscope className='h-4 w-4 text-sky-700' />
            Este caso no tiene anotaciones clínicas todavía.
          </div>
        </div>
      )}
    </section>
  );
};

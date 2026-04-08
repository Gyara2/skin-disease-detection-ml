import type {
  PrediccionCaso,
  PrediccionProbabilidad,
  ResultadoClinico,
  ValidacionCaso,
} from '@/shared/types';

import type { EstadoUiItem } from './caso-detalle-sections.types';

interface CasoDetalleIaSectionProps {
  puedeVerPrediccion: boolean;
  estadoPrediccion: EstadoUiItem | null;
  estadoValidacion: EstadoUiItem | null;
  ultimaPrediccion: PrediccionCaso | null;
  ultimaPrediccionDiagnosticoId?: string;
  prediccionPrincipal: PrediccionProbabilidad | null;
  probabilidadesPrediccion: PrediccionProbabilidad[];
  ultimaValidacion: ValidacionCaso | null;
  formatPredictionPercentage: (percentage: number) => string;
  resultadoClinicoLabel: Record<ResultadoClinico, string>;
}

export const CasoDetalleIaSection = ({
  puedeVerPrediccion,
  estadoPrediccion,
  estadoValidacion,
  ultimaPrediccion,
  ultimaPrediccionDiagnosticoId,
  prediccionPrincipal,
  probabilidadesPrediccion,
  ultimaValidacion,
  formatPredictionPercentage,
  resultadoClinicoLabel,
}: CasoDetalleIaSectionProps) => {
  if (!puedeVerPrediccion) {
    return (
      <section id='ia-validacion-caso'>
        <article className='rounded-[28px] border border-slate-200 bg-white/85 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.28)] backdrop-blur'>
          <p className='text-xs font-medium uppercase tracking-[0.28em] text-slate-500'>
            Acceso clínico
          </p>
          <h2 className='mt-2 text-xl font-semibold tracking-tight text-slate-950'>
            Predicción interna restringida
          </h2>
          <p className='mt-3 max-w-3xl text-sm leading-6 text-slate-600'>
            La salida automática de la IA y su validación solo están
            disponibles para el especialista responsable y para administración.
          </p>
        </article>
      </section>
    );
  }

  return (
    <section id='ia-validacion-caso' className='space-y-4'>
      <div>
        <p className='text-xs font-medium uppercase tracking-[0.28em] text-sky-700'>
          IA y validación
        </p>
        <h2 className='mt-2 text-2xl font-semibold tracking-tight text-slate-950'>
          Lectura automática y diagnóstico final
        </h2>
      </div>

      <div className='grid gap-4 xl:grid-cols-[1.05fr_0.95fr]'>
        <article className='rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.28)] backdrop-blur'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
            <div className='space-y-2'>
              <p className='text-xs font-medium uppercase tracking-[0.28em] text-sky-700'>
                Predicción automática
              </p>
              <h2 className='text-xl font-semibold tracking-tight text-slate-950'>
                Última salida del sistema
              </h2>
              <p className='text-sm leading-6 text-slate-600'>
                Cada imagen registrada en una anotación clínica puede generar su
                propia predicción automática.
              </p>
            </div>

            {estadoPrediccion ? (
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${estadoPrediccion.badge}`}
              >
                {estadoPrediccion.label}
              </span>
            ) : null}
          </div>

          {ultimaPrediccion ? (
            <div className='mt-5 space-y-4'>
              <div className='grid gap-3 sm:grid-cols-2'>
                <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3'>
                  <p className='text-xs font-medium uppercase tracking-[0.24em] text-slate-500'>
                    Predicción principal
                  </p>
                  <p className='mt-2 text-sm font-semibold text-slate-950'>
                    {prediccionPrincipal?.etiqueta ?? 'Sin clasificación'}
                  </p>
                </div>

                <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3'>
                  <p className='text-xs font-medium uppercase tracking-[0.24em] text-slate-500'>
                    Probabilidad principal
                  </p>
                  <p className='mt-2 text-sm font-semibold text-slate-950'>
                    {prediccionPrincipal
                      ? formatPredictionPercentage(prediccionPrincipal.porcentaje)
                      : 'Sin dato'}
                  </p>
                </div>
              </div>

              <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3'>
                <div className='flex items-center justify-between gap-3'>
                  <p className='text-xs font-medium uppercase tracking-[0.24em] text-slate-500'>
                    Top 3 de probabilidades
                  </p>
                  <p className='text-xs uppercase tracking-[0.24em] text-slate-400'>
                    Registro {ultimaPrediccionDiagnosticoId}
                  </p>
                </div>

                {probabilidadesPrediccion.length ? (
                  <div className='mt-4 space-y-3'>
                    {probabilidadesPrediccion.map((item, index) => {
                      const barColor =
                        index === 0
                          ? 'bg-sky-500'
                          : index === 1
                            ? 'bg-cyan-500'
                            : 'bg-slate-400';

                      return (
                        <div key={`${item.etiqueta}-${index}`} className='space-y-2'>
                          <div className='flex items-center justify-between gap-3 text-sm'>
                            <p className='font-medium text-slate-950'>
                              {index + 1}. {item.etiqueta}
                            </p>
                            <p className='font-semibold text-slate-700'>
                              {formatPredictionPercentage(item.porcentaje)}
                            </p>
                          </div>

                          <div className='h-2 overflow-hidden rounded-full bg-slate-200'>
                            <div
                              className={`h-full rounded-full ${barColor}`}
                              style={{ width: `${Math.max(item.porcentaje, 4)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className='mt-3 text-sm leading-6 text-slate-700'>
                    El sistema no ha devuelto probabilidades para esta
                    predicción todavía.
                  </p>
                )}
              </div>

              <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'>
                <p className='font-medium text-slate-950'>
                  {ultimaPrediccion.modeloVersion ??
                    ultimaPrediccion.modelo ??
                    'Modelo no indicado'}
                </p>
                <p className='mt-2 leading-6'>
                  {ultimaPrediccion.resumen ?? estadoPrediccion?.description}
                </p>
                <p className='mt-3 text-xs uppercase tracking-[0.24em] text-slate-500'>
                  {ultimaPrediccion.creado
                    ? `Generada el ${ultimaPrediccion.creado.toLocaleDateString('es-ES')}`
                    : 'Fecha de generación no disponible'}
                </p>
              </div>
            </div>
          ) : (
            <div className='mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700'>
              Este caso todavía no tiene predicciones asociadas.
            </div>
          )}
        </article>

        <article className='rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.28)] backdrop-blur'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
            <div className='space-y-2'>
              <p className='text-xs font-medium uppercase tracking-[0.28em] text-sky-700'>
                Validación
              </p>
              <h2 className='text-xl font-semibold tracking-tight text-slate-950'>
                Último diagnóstico final
              </h2>
              <p className='text-sm leading-6 text-slate-600'>
                La validación recoge el diagnóstico final emitido por el
                especialista sobre una predicción concreta del caso.
              </p>
            </div>

            {estadoValidacion ? (
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${estadoValidacion.badge}`}
              >
                {estadoValidacion.label}
              </span>
            ) : null}
          </div>

          {ultimaValidacion ? (
            <div className='mt-5 space-y-4'>
              <div className='grid gap-3'>
                <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3'>
                  <p className='text-xs font-medium uppercase tracking-[0.24em] text-slate-500'>
                    Diagnóstico final
                  </p>
                  <p className='mt-2 text-sm font-semibold text-slate-950'>
                    {ultimaValidacion.resultadoFinal
                      ? resultadoClinicoLabel[ultimaValidacion.resultadoFinal]
                      : 'Pendiente de decisión'}
                  </p>
                </div>
              </div>

              <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'>
                <p className='leading-6'>
                  {ultimaValidacion.resumen ?? estadoValidacion?.description}
                </p>
                {ultimaValidacion.nota ? (
                  <p className='mt-3 leading-6 text-slate-600'>
                    {ultimaValidacion.nota}
                  </p>
                ) : null}
                <p className='mt-3 text-xs uppercase tracking-[0.24em] text-slate-500'>
                  {ultimaValidacion.actualizado
                    ? `Actualizada el ${ultimaValidacion.actualizado.toLocaleDateString('es-ES')}`
                    : 'Sin fecha de validación'}
                </p>
              </div>
            </div>
          ) : (
            <div className='mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700'>
              No hay validaciones registradas para este caso todavía.
            </div>
          )}
        </article>
      </div>
    </section>
  );
};

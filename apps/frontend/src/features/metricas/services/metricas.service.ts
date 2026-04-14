import { ENV } from '@/shared/config/env';
import type { Metricas, MetricasDTO } from '@/shared/types';
import { getMetricasFromApi } from './metricas.api';
import { getMetricasFromMock } from './metricas.mock';

const mapMetricasToModel = (metricas: MetricasDTO): Metricas => ({
  versionModelo: metricas.version_modelo,
  fechaEntrenamiento: new Date(metricas.fecha_entrenamiento),
  totalMuestrasEvaluacion: metricas.total_muestras_evaluacion,
  accuracy: metricas.accuracy,
  precisionMacro: metricas.precision_macro,
  recallMacro: metricas.recall_macro,
  f1Macro: metricas.f1_macro,
  aucRoc: metricas.auc_roc,
  sensibilidad: metricas.sensibilidad,
  especificidad: metricas.especificidad,
  metricasPorClase: metricas.metricas_por_clase.map((clase) => ({
    clase: clase.clase,
    precision: clase.precision,
    recall: clase.recall,
    f1Score: clase.f1_score,
    soporte: clase.soporte,
  })),
});

export const getMetricas = async (): Promise<Metricas> => {
  const data = ENV.USE_MOCK
    ? await getMetricasFromMock()
    : await getMetricasFromApi();

  return mapMetricasToModel(data);
};

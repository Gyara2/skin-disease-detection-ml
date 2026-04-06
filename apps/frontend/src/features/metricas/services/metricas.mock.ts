import type { MetricasDTO } from '@/shared/types';

export const getMetricasFromMock = async (): Promise<MetricasDTO> => {
  return {
    version_modelo: 'skin-classifier-v0.3.0',
    fecha_entrenamiento: '2026-03-15T10:30:00.000Z',
    total_muestras_evaluacion: 1248,
    accuracy: 0.914,
    precision_macro: 0.901,
    recall_macro: 0.894,
    f1_macro: 0.897,
    auc_roc: 0.962,
    sensibilidad: 0.889,
    especificidad: 0.948,
    metricas_por_clase: [
      {
        clase: 'melanoma',
        precision: 0.884,
        recall: 0.852,
        f1_score: 0.868,
        soporte: 173,
      },
      {
        clase: 'nevus',
        precision: 0.926,
        recall: 0.947,
        f1_score: 0.936,
        soporte: 402,
      },
      {
        clase: 'queratosis_seborreica',
        precision: 0.897,
        recall: 0.881,
        f1_score: 0.889,
        soporte: 221,
      },
      {
        clase: 'carcinoma_basocelular',
        precision: 0.904,
        recall: 0.891,
        f1_score: 0.897,
        soporte: 196,
      },
      {
        clase: 'lesion_vascular',
        precision: 0.933,
        recall: 0.899,
        f1_score: 0.916,
        soporte: 95,
      },
      {
        clase: 'dermatofibroma',
        precision: 0.861,
        recall: 0.892,
        f1_score: 0.876,
        soporte: 161,
      },
    ],
  };
};

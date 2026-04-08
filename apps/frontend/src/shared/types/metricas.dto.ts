export interface MetricaPorClaseDTO {
  clase: string;
  precision: number;
  recall: number;
  f1_score: number;
  soporte: number;
}

export interface MetricasDTO {
  version_modelo: string;
  fecha_entrenamiento: string;
  total_muestras_evaluacion: number;
  accuracy: number;
  precision_macro: number;
  recall_macro: number;
  f1_macro: number;
  auc_roc: number;
  sensibilidad: number;
  especificidad: number;
  metricas_por_clase: MetricaPorClaseDTO[];
}

export interface MetricaPorClase {
  clase: string;
  precision: number;
  recall: number;
  f1Score: number;
  soporte: number;
}

export interface Metricas {
  versionModelo: string;
  fechaEntrenamiento: Date;
  totalMuestrasEvaluacion: number;
  accuracy: number;
  precisionMacro: number;
  recallMacro: number;
  f1Macro: number;
  aucRoc: number;
  sensibilidad: number;
  especificidad: number;
  metricasPorClase: MetricaPorClase[];
}

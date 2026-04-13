import { apiGet } from '@/shared/lib/api';
import type { MetricasDTO } from '@/shared/types';

export const getMetricasFromApi = () => {
  return apiGet<MetricasDTO>(
    '/metricas-modelo',
    'No se pudieron cargar las metricas del modelo',
  );
};

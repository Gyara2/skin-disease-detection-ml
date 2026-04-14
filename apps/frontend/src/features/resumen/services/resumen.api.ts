import { apiGet } from '@/shared/lib/api';
import type { ResumenDTO } from '@/shared/types';

export const getResumenFromApi = () => {
  return apiGet<ResumenDTO>('/resumen', 'No se pudo cargar el resumen');
};

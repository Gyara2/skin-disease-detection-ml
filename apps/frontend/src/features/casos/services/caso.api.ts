import { apiGet } from '@/shared/lib/api';
import type { CasoDTO, CasoDetalleDTO } from '@/shared/types';

export const getCasosFromApi = () => {
  return apiGet<CasoDTO[]>('/casos', 'No se pudieron cargar los casos');
};

export const getCasoDetalleFromApi = (id: string) => {
  return apiGet<CasoDetalleDTO>(
    `/casos/${id}`,
    'No se pudo cargar el detalle del caso',
  );
};

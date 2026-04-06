import { ENV } from '@/shared/config/env';
import { mapCasoDetalle } from '../mappers/caso-detalle.mapper';
import { mockCasoDetalleById } from './caso-detalle.mock';
import type { CasoDetalle, CasoDetalleDTO } from '../types/caso-detalle.types';

export const getCasoDetalle = async (id: string): Promise<CasoDetalle> => {
  let data: CasoDetalleDTO;

  if (ENV.USE_MOCK) {
    data = mockCasoDetalleById[id];
  } else {
    const response = await fetch(`${ENV.API_URL}/casos/${id}`);

    if (!response.ok) {
      throw new Error('No se pudo cargar el detalle del caso');
    }

    data = await response.json();
  }

  if (!data) {
    throw new Error('No se ha encontrado el caso solicitado');
  }

  return mapCasoDetalle(data);
};

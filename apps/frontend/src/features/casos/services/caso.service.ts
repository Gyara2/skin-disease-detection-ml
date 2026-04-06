import type { Caso, CasoDetalle } from '@/shared/types';
import { ENV } from '@/shared/config/env';
import { mapCasoDetalle } from '../mappers/caso-detalle.mapper';
import { mapCasoToModel } from '../mappers/caso.mapper';
import { getCasoDetalleFromApi, getCasosFromApi } from './caso.api';
import { getCasoDetalleFromMock, getCasosFromMock } from './caso.mock';

export const getCasos = async (): Promise<Caso[]> => {
  const data = ENV.USE_MOCK
    ? await getCasosFromMock()
    : await getCasosFromApi();

  return data.map(mapCasoToModel);
};

export const getCasoDetalle = async (id: string): Promise<CasoDetalle> => {
  const data = ENV.USE_MOCK
    ? await getCasoDetalleFromMock(id)
    : await getCasoDetalleFromApi(id);

  if (!data) {
    throw new Error('No se ha encontrado el caso solicitado');
  }

  return mapCasoDetalle(data);
};

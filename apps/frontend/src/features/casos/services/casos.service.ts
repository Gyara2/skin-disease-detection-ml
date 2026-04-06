import { ENV } from '@/shared/config/env';
import { mapCasoToModel } from '../mappers/caso.mapper';
import type { Caso, CasoDTO } from '../types/caso.types';
import { mockCasos } from './casos.mock';

export const getCasos = async (): Promise<Caso[]> => {
  let data: CasoDTO[];

  if (ENV.USE_MOCK) {
    data = mockCasos;
  } else {
    const response = await fetch(`${ENV.API_URL}/casos`);
    data = await response.json();
  }

  return data.map(mapCasoToModel);
};

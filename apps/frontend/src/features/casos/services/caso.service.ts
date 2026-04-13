import type {
  ActualizarEstadoCasoInput,
  Caso,
  CasoDetalle,
  CrearCasoInput,
  CrearDiagnosticoInput,
  CrearValidacionInput,
} from '@/shared/types';
import { ENV } from '@/shared/config/env';
import { mapCasoDetalle } from '../mappers/caso-detalle.mapper';
import { mapCasoToModel } from '../mappers/caso.mapper';
import {
  actualizarEstadoCasoFromApi,
  crearCasoFromApi,
  crearDiagnosticoFromApi,
  crearValidacionFromApi,
  getCasoDetalleFromApi,
  getCasosFromApi,
} from './caso.api';
import {
  actualizarEstadoCasoFromMock,
  crearCasoFromMock,
  crearDiagnosticoFromMock,
  crearValidacionFromMock,
  getCasoDetalleFromMock,
  getCasosFromMock,
} from './caso.mock';

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

export const crearCaso = async (input: CrearCasoInput): Promise<CasoDetalle> => {
  const data = ENV.USE_MOCK
    ? await crearCasoFromMock(input)
    : await crearCasoFromApi(input);

  return mapCasoDetalle(data);
};

export const actualizarEstadoCaso = async (
  casoId: string,
  input: ActualizarEstadoCasoInput,
): Promise<CasoDetalle> => {
  const data = ENV.USE_MOCK
    ? await actualizarEstadoCasoFromMock(casoId, input)
    : await actualizarEstadoCasoFromApi(casoId, input);

  return mapCasoDetalle(data);
};

export const crearDiagnostico = async (
  casoId: string,
  input: CrearDiagnosticoInput,
): Promise<CasoDetalle> => {
  const data = ENV.USE_MOCK
    ? await crearDiagnosticoFromMock(casoId, input)
    : await crearDiagnosticoFromApi(casoId, input);

  return mapCasoDetalle(data);
};

export const crearValidacion = async (
  casoId: string,
  input: CrearValidacionInput,
): Promise<CasoDetalle> => {
  const data = ENV.USE_MOCK
    ? await crearValidacionFromMock(casoId, input)
    : await crearValidacionFromApi(casoId, input);

  return mapCasoDetalle(data);
};

import type {
  ActualizarEstadoCasoInput,
  Caso,
  CasoDetalle,
  CrearCasoInput,
  CrearDiagnosticoInput,
  GuardarDiagnosticoEspecialistaInput,
  CrearValidacionInput,
} from '@/shared/types';
import { ENV } from '@/shared/config/env';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { mapCasoDetalle } from '../mappers/caso-detalle.mapper';
import { mapCasoToModel } from '../mappers/caso.mapper';
import {
  actualizarEstadoCasoFromApi,
  agregarImagenCasoFromApi,
  crearCasoFromApi,
  crearDiagnosticoFromApi,
  crearValidacionFromApi,
  guardarDiagnosticoEspecialistaFromApi,
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
  const auth = useAuthStore.getState().usuario;

  if (!auth) {
    return [];
  }

  const data = ENV.USE_MOCK
    ? await getCasosFromMock()
    : await getCasosFromApi(auth.email, auth.rol);

  return data.map(mapCasoToModel);
};

export const getCasoDetalle = async (id: string): Promise<CasoDetalle> => {
  const auth = useAuthStore.getState().usuario;
  const data = ENV.USE_MOCK
    ? await getCasoDetalleFromMock(id)
    : await getCasoDetalleFromApi(id, auth?.email, auth?.rol);

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

export const agregarImagenCaso = async (
  casoId: string,
  pacienteId: string,
  especialistaId: string,
  imagenBase64: string,
): Promise<CasoDetalle> => {
  const data = ENV.USE_MOCK
    ? await crearDiagnosticoFromMock(casoId, { imagenBase64, nota: 'Imagen añadida' })
    : await agregarImagenCasoFromApi(casoId, pacienteId, especialistaId, imagenBase64);

  return mapCasoDetalle(data);
};

export const actualizarEstadoCaso = async (
  casoId: string,
  input: ActualizarEstadoCasoInput,
): Promise<CasoDetalle> => {
  const data = ENV.USE_MOCK
    ? await actualizarEstadoCasoFromMock(casoId, input)
    : await actualizarEstadoCasoFromApi();

  return mapCasoDetalle(data);
};

export const crearDiagnostico = async (
  casoId: string,
  input: CrearDiagnosticoInput,
): Promise<CasoDetalle> => {
  const data = ENV.USE_MOCK
    ? await crearDiagnosticoFromMock(casoId, input)
    : await crearDiagnosticoFromApi();

  return mapCasoDetalle(data);
};

export const crearValidacion = async (
  casoId: string,
  input: CrearValidacionInput,
): Promise<CasoDetalle> => {
  const data = ENV.USE_MOCK
    ? await crearValidacionFromMock(casoId, input)
    : await crearValidacionFromApi();

  return mapCasoDetalle(data);
};

export const guardarDiagnosticoEspecialista = async (
  casoId: string,
  input: GuardarDiagnosticoEspecialistaInput,
): Promise<CasoDetalle> => {
  if (ENV.USE_MOCK) {
    throw new Error('El diagnóstico del especialista no está disponible en modo mock.');
  }

  const data = await guardarDiagnosticoEspecialistaFromApi(casoId, input);

  return mapCasoDetalle(data);
};

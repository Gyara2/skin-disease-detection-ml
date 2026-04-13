import { ENV } from '@/shared/config/env';
import type {
  AsignarRolUsuarioInput,
  CrearUsuarioInput,
  Usuario,
} from '@/shared/types';
import {
  asignarRolUsuarioFromApi,
  crearUsuarioFromApi,
  getUsuariosFromApi,
} from './usuario.api';
import {
  asignarRolUsuarioFromMock,
  crearUsuarioFromMock,
  getUsuariosFromMock,
} from './usuario.mock';

export const getUsuarios = async (): Promise<Usuario[]> => {
  if (ENV.USE_MOCK) {
    return getUsuariosFromMock();
  }

  return getUsuariosFromApi();
};

export const crearUsuario = async (
  input: CrearUsuarioInput,
): Promise<Usuario> => {
  if (ENV.USE_MOCK) {
    return crearUsuarioFromMock(input);
  }

  return crearUsuarioFromApi(input);
};

export const asignarRolUsuario = async (
  usuarioId: string,
  input: AsignarRolUsuarioInput,
): Promise<Usuario> => {
  if (ENV.USE_MOCK) {
    return asignarRolUsuarioFromMock(usuarioId, input);
  }

  return asignarRolUsuarioFromApi(usuarioId, input);
};

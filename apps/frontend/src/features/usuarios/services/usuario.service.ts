import { ENV } from '@/shared/config/env';
import type { Usuario } from '@/shared/types';
import { getUsuariosFromApi } from './usuario.api';
import { getUsuariosFromMock } from './usuario.mock';

export const getUsuarios = async (): Promise<Usuario[]> => {
  if (ENV.USE_MOCK) {
    return getUsuariosFromMock();
  }

  return getUsuariosFromApi();
};

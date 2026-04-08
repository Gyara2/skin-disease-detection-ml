import { apiGet } from '@/shared/lib/api';
import type { Usuario } from '@/shared/types';

export const getUsuariosFromApi = () => {
  return apiGet<Usuario[]>('/usuarios', 'No se pudieron cargar los usuarios');
};

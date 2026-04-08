import { apiGet, apiPatch, apiPost } from '@/shared/lib/api';
import type {
  AsignarRolUsuarioInput,
  CrearUsuarioInput,
  Usuario,
} from '@/shared/types';

export const getUsuariosFromApi = () => {
  return apiGet<Usuario[]>('/usuarios', 'No se pudieron cargar los usuarios');
};

export const crearUsuarioFromApi = (input: CrearUsuarioInput) => {
  return apiPost<Usuario, CrearUsuarioInput>(
    '/usuarios',
    input,
    'No se pudo crear el usuario',
  );
};

export const asignarRolUsuarioFromApi = (
  usuarioId: string,
  input: AsignarRolUsuarioInput,
) => {
  return apiPatch<Usuario, AsignarRolUsuarioInput>(
    `/usuarios/${usuarioId}/rol`,
    input,
    'No se pudo actualizar el rol del usuario',
  );
};

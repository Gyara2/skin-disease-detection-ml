import { mockUsuarios } from '@/features/usuarios/services/usuario.mock';
import { getUsuarioNombreCompleto } from '@/shared/types';

export const usuarioCasoNombrePorId = Object.fromEntries(
  mockUsuarios.map((usuario) => [usuario.id, getUsuarioNombreCompleto(usuario)]),
) as Record<string, string>;

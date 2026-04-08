import { mockUsuarios } from '@/features/usuarios/services/usuario.mock';

export const usuarioCasoNombrePorId = Object.fromEntries(
  mockUsuarios.map((usuario) => [usuario.id, usuario.nombre]),
) as Record<string, string>;

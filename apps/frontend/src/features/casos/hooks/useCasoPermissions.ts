import type { Caso, Usuario } from '@/shared/types';

import { useMemo } from 'react';

export const useCasoPermissions = (
  caso: Caso | undefined,
  usuario: Usuario | null,
) => {
  return useMemo(() => {
    if (!caso || !usuario) return null;

    const esAdmin = usuario.rol === 'ADMIN';
    const esResponsable =
      usuario.rol === 'ESPECIALISTA' && usuario.id === caso.especialistaId;
    const esDueño =
      usuario.rol === 'PACIENTE' && usuario.id === caso.pacienteId;

    return {
      canViewAI: esAdmin || esResponsable,
      canManage: esAdmin || esResponsable,
      canViewHistory: esAdmin || esResponsable || esDueño,
      isOwner: esDueño,
    };
  }, [caso, usuario]);
};

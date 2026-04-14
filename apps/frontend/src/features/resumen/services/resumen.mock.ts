import { mockCasos } from '@/features/casos/services/caso.mock';
import { mockUsuarios } from '@/features/usuarios/services/usuario.mock';
import type { ResumenDTO } from '@/shared/types';

export const getResumenFromMock = async (): Promise<ResumenDTO> => {
  return {
    total_casos: mockCasos.length,
    casos_pendientes: mockCasos.filter((caso) => caso.estado === 'pendiente')
      .length,
    casos_en_proceso: mockCasos.filter((caso) => caso.estado === 'en_proceso')
      .length,
    casos_completados: mockCasos.filter((caso) => caso.estado === 'completado')
      .length,
    total_usuarios: mockUsuarios.length,
    total_pacientes: mockUsuarios.filter((usuario) => usuario.rol === 'PACIENTE')
      .length,
    total_especialistas: mockUsuarios.filter(
      (usuario) => usuario.rol === 'ESPECIALISTA',
    ).length,
  };
};

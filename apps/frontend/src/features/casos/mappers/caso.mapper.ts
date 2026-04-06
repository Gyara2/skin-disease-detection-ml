import { estadoCasoMap } from '../constants/estado-caso';
import { usuarioCasoNombrePorId } from '../mocks/usuarios-casos.mock';
import type { Caso, CasoDTO } from '../types/caso.types';

export const mapCasoToModel = (dto: CasoDTO): Caso => {
  const estadoInfo = estadoCasoMap[dto.estado];

  return {
    id: dto.id,
    pacienteId: dto.paciente_id,
    pacienteNombre:
      usuarioCasoNombrePorId[dto.paciente_id] ?? 'Paciente no disponible',
    especialistaId: dto.especialista_id,
    especialistaNombre:
      usuarioCasoNombrePorId[dto.especialista_id] ?? 'Especialista no disponible',
    estado: dto.estado,
    estadoLabel: estadoInfo?.label ?? dto.estado,
    estadoColor: estadoInfo?.color ?? 'bg-gray-100',
    creado: new Date(dto.creado),
  };
};

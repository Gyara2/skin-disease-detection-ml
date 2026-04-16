import type {
  Caso,
  CasoDTO,
} from '@/shared/types';
import { estadoCasoMap } from '../constants/estado-caso';
import { usuarioCasoNombrePorId } from '../mocks/usuarios-casos.mock';

export const mapCasoToModel = (dto: CasoDTO): Caso => {
  const estadoInfo = estadoCasoMap[dto.estado];
  const totalImagenes = dto.imagenes_count ?? dto.diagnosticos_count ?? 0;

  return {
    id: dto.id,
    pacienteId: dto.paciente_id,
    pacienteNombre:
      dto.paciente_nombre ??
      usuarioCasoNombrePorId[dto.paciente_id] ??
      'Paciente no disponible',
    especialistaId: dto.especialista_id,
    especialistaNombre:
      dto.especialista_nombre ??
      usuarioCasoNombrePorId[dto.especialista_id] ??
      'Especialista no disponible',
    estado: dto.estado,
    diagnosticosCount: totalImagenes,
    imagenesCount: totalImagenes,
    estadoLabel: estadoInfo?.label ?? dto.estado,
    estadoColor: estadoInfo?.color ?? 'bg-gray-100',
    creado: new Date(dto.creado),
    actualizado: new Date(dto.actualizado),
  };
};

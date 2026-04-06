import type {
  CasoDetalle,
  CasoDetalleDTO,
  UsuarioDTO,
} from '@/shared/types';
import { estadoCasoMap } from '../constants/estado-caso';

const mapUsuario = (user: UsuarioDTO) => ({
  id: user.id,
  nombreCompleto: `${user.nombre} ${user.apellido1} ${user.apellido2}`.trim(),
});

export const mapCasoDetalle = (dto: CasoDetalleDTO): CasoDetalle => {
  const estadoInfo = estadoCasoMap[dto.estado];

  return {
    id: dto.id,
    estado: dto.estado,
    estadoLabel: estadoInfo?.label ?? dto.estado,
    estadoColor: estadoInfo?.color ?? 'bg-gray-100',

    paciente: mapUsuario(dto.paciente),
    especialista: mapUsuario(dto.especialista),

    diagnosticos: dto.diagnosticos.map((d) => ({
      id: d.id,
      nota: d.nota,
      creado: new Date(d.creado),
    })),

    creado: new Date(dto.creado),
  };
};

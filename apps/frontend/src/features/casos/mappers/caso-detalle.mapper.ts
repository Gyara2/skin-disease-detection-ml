import type {
  CasoDetalle,
  CasoDetalleDTO,
  DiagnosticoDTO,
  ImagenDTO,
  PrediccionDTO,
  UsuarioDTO,
  ValidacionDTO,
} from '@/shared/types';
import { estadoCasoMap } from '../constants/estado-caso';

const mapUsuario = (user: UsuarioDTO) => ({
  id: user.id,
  nombreCompleto: `${user.nombre} ${user.apellido1} ${user.apellido2}`.trim(),
});

const mapImagen = (imagen?: ImagenDTO | null, imagenId?: string) => {
  if (!imagen && !imagenId) {
    return null;
  }

  return {
    id: imagen?.id ?? imagenId ?? '',
    storageKey: imagen?.storage_key ?? null,
    mimeType: imagen?.mime_type ?? null,
    size: imagen?.size ?? null,
    uploadedAt: imagen?.uploaded_at ? new Date(imagen.uploaded_at) : null,
    src: imagen?.src ?? null,
  };
};

const mapValidacion = (validacion?: ValidacionDTO | null) => {
  if (!validacion) {
    return null;
  }

  return {
    id: validacion.id ?? '',
    prediccionId: validacion.prediccion_id ?? null,
    especialistaId: validacion.especialista_id ?? null,
    estado: validacion.estado,
    resultadoFinal: validacion.resultado_final ?? null,
    nota: validacion.nota ?? null,
    creado: validacion.creado ? new Date(validacion.creado) : null,
    actualizado:
      validacion.actualizado
        ? new Date(validacion.actualizado)
        : validacion.creado
          ? new Date(validacion.creado)
          : null,
    resumen: validacion.resumen ?? null,
  };
};

const mapPrediccion = (prediccion?: PrediccionDTO | null) => {
  if (!prediccion) {
    return null;
  }

  return {
    id: prediccion.id ?? '',
    diagnosticoId: prediccion.diagnostico_id ?? null,
    estado: prediccion.estado,
    probabilidades: [...(prediccion.probabilidades ?? [])]
      .sort((a, b) => b.porcentaje - a.porcentaje)
      .slice(0, 3)
      .map((item) => ({
        etiqueta: item.etiqueta,
        porcentaje: item.porcentaje,
      })),
    creado: prediccion.creado ? new Date(prediccion.creado) : null,
    modelo: prediccion.modelo ?? null,
    modeloVersion: prediccion.modelo_version ?? null,
    resumen: prediccion.resumen ?? null,
    validaciones:
      prediccion.validaciones
        ?.map(mapValidacion)
        .filter((item) => item !== null) ?? [],
  };
};

const mapDiagnostico = (diagnostico: DiagnosticoDTO) => {
  return {
    id: diagnostico.id,
    casoId: diagnostico.caso_id ?? null,
    imagenId: diagnostico.imagen_id,
    imagen: mapImagen(diagnostico.imagen, diagnostico.imagen_id),
    nota: diagnostico.nota,
    creado: new Date(diagnostico.creado),
    predicciones:
      diagnostico.predicciones
        ?.map(mapPrediccion)
        .filter((item) => item !== null) ?? [],
  };
};

export const mapCasoDetalle = (dto: CasoDetalleDTO): CasoDetalle => {
  const estadoInfo = estadoCasoMap[dto.estado];

  return {
    id: dto.id,
    estado: dto.estado,
    estadoLabel: estadoInfo?.label ?? dto.estado,
    estadoColor: estadoInfo?.color ?? 'bg-gray-100',

    paciente: mapUsuario(dto.paciente),
    especialista: mapUsuario(dto.especialista),

    diagnosticos: dto.diagnosticos.map(mapDiagnostico),

    creado: new Date(dto.creado),
    actualizado: new Date(dto.actualizado),
  };
};

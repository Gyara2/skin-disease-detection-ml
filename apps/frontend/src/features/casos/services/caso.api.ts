import { apiGet, apiPatch, apiPost } from '@/shared/lib/api';
import type {
  ActualizarEstadoCasoInput,
  CasoDTO,
  CasoDetalleDTO,
  CrearCasoInput,
  CrearDiagnosticoInput,
  CrearValidacionInput,
} from '@/shared/types';

export const getCasosFromApi = () => {
  return apiGet<CasoDTO[]>('/casos', 'No se pudieron cargar los casos');
};

export const getCasoDetalleFromApi = (id: string) => {
  return apiGet<CasoDetalleDTO>(
    `/casos/${id}`,
    'No se pudo cargar el detalle del caso',
  );
};

export const crearCasoFromApi = (input: CrearCasoInput) => {
  return apiPost<
    CasoDetalleDTO,
    {
      paciente_id: string;
      especialista_id: string;
      imagen_base64: string;
    }
  >(
    '/casos',
    {
      paciente_id: input.pacienteId,
      especialista_id: input.especialistaId,
      imagen_base64: input.imagenBase64,
    },
    'No se pudo crear el caso',
  );
};

export const actualizarEstadoCasoFromApi = (
  casoId: string,
  input: ActualizarEstadoCasoInput,
) => {
  return apiPatch<CasoDetalleDTO, { estado: ActualizarEstadoCasoInput['estado'] }>(
    `/casos/${casoId}/estado`,
    { estado: input.estado },
    'No se pudo actualizar el estado del caso',
  );
};

export const crearDiagnosticoFromApi = (
  casoId: string,
  input: CrearDiagnosticoInput,
) => {
  return apiPost<CasoDetalleDTO, { imagen_base64: string; nota: string }>(
    `/casos/${casoId}/diagnosticos`,
    {
      imagen_base64: input.imagenBase64,
      nota: input.nota,
    },
    'No se pudo registrar el diagnostico',
  );
};

export const crearValidacionFromApi = (
  casoId: string,
  input: CrearValidacionInput,
) => {
  return apiPost<
    CasoDetalleDTO,
    {
      prediccion_id: string;
      resultado_final: CrearValidacionInput['resultadoFinal'];
      nota?: string;
    }
  >(
    `/casos/${casoId}/validaciones`,
    {
      prediccion_id: input.prediccionId,
      resultado_final: input.resultadoFinal,
      ...(input.nota?.trim() ? { nota: input.nota.trim() } : {}),
    },
    'No se pudo registrar la validacion',
  );
};

import { apiGet, apiPatch, apiPost } from '@/shared/lib/api';
import { toRawBase64 } from '@/shared/lib/image-file';
import type {
  CasoDTO,
  CasoDetalleDTO,
  CrearCasoInput,
} from '@/shared/types';

interface UpsertCasoPayload {
  id?: string | null;
  paciente: string;
  especialista: string;
  imagenes: string[];
}

interface GuardarDiagnosticoPayload {
  especialistaId: string;
  diagnostico: string;
  nota?: string;
}

export const getCasosFromApi = (actorEmail: string, actorRol: string) => {
  const params = new URLSearchParams({
    actorEmail,
    actorRol,
  });

  return apiGet<CasoDTO[]>(`/casos?${params.toString()}`, 'No se pudieron cargar los casos');
};

export const getCasoDetalleFromApi = (id: string) => {
  return apiGet<CasoDetalleDTO>(
    `/casos/${id}`,
    'No se pudo cargar el detalle del caso',
  );
};

export const upsertCasoFromApi = (payload: UpsertCasoPayload) => {
  return apiPost<CasoDetalleDTO, UpsertCasoPayload>(
    '/casos',
    {
      ...payload,
      imagenes: payload.imagenes.map((item) => toRawBase64(item.trim())),
    },
    'No se pudo guardar el caso',
  );
};

export const crearCasoFromApi = (input: CrearCasoInput) => {
  return upsertCasoFromApi({
    id: null,
    paciente: input.pacienteId,
    especialista: input.especialistaId,
    imagenes: [input.imagenBase64],
  });
};

export const agregarImagenCasoFromApi = (
  casoId: string,
  pacienteId: string,
  especialistaId: string,
  imagenBase64: string,
) => {
  return upsertCasoFromApi({
    id: casoId,
    paciente: pacienteId,
    especialista: especialistaId,
    imagenes: [imagenBase64],
  });
};

export const actualizarEstadoCasoFromApi = async () => {
  throw new Error('La actualización de estado no está disponible en esta fase.');
};

export const crearDiagnosticoFromApi = async () => {
  throw new Error('Los diagnósticos no están disponibles en esta fase.');
};

export const crearValidacionFromApi = async () => {
  throw new Error('Las validaciones no están disponibles en esta fase.');
};

export const guardarDiagnosticoEspecialistaFromApi = (
  casoId: string,
  payload: GuardarDiagnosticoPayload,
) => {
  return apiPatch<CasoDetalleDTO, GuardarDiagnosticoPayload>(
    `/casos/${casoId}/diagnostico`,
    payload,
    'No se pudo guardar el diagnóstico del especialista',
  );
};

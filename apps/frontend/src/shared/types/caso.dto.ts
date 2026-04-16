import type {
  EstadoCaso,
  EstadoPrediccion,
  EstadoValidacion,
  ResultadoClinico,
} from './caso.model';

export interface PrediccionProbabilidadDTO {
  etiqueta: string;
  porcentaje: number;
}

export interface PrediccionDTO {
  id?: string;
  diagnostico_id?: string;
  estado: EstadoPrediccion;
  probabilidades?: PrediccionProbabilidadDTO[] | null;
  creado?: string | null;
  modelo?: string | null;
  modelo_version?: string | null;
  resumen?: string | null;
  validaciones?: ValidacionDTO[] | null;
}

export interface ValidacionDTO {
  id?: string;
  prediccion_id?: string;
  especialista_id?: string;
  estado: EstadoValidacion;
  resultado_final?: ResultadoClinico | null;
  nota?: string | null;
  actualizado?: string | null;
  creado?: string | null;
  resumen?: string | null;
}

export interface CasoDTO {
  id: string;
  paciente_id: string;
  paciente_nombre?: string | null;
  especialista_id: string;
  especialista_nombre?: string | null;
  estado: EstadoCaso;
  diagnosticos_count?: number | null;
  imagenes_count?: number | null;
  creado: string;
  actualizado: string;
}

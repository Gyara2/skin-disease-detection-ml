export type EstadoCaso = 'pendiente' | 'en_proceso' | 'completado';
export type EstadoPrediccion = 'pendiente' | 'lista' | 'error';
export type EstadoValidacion = 'pendiente' | 'confirmada' | 'ajustada';
export type ResultadoClinico =
  | 'benigno'
  | 'inflamatorio'
  | 'sospechoso'
  | 'requiere_revision';

export interface CrearCasoInput {
  pacienteId: string;
  especialistaId: string;
  imagenBase64: string;
}

export interface ActualizarEstadoCasoInput {
  estado: EstadoCaso;
}

export interface CrearDiagnosticoInput {
  imagenBase64: string;
  nota: string;
}

export interface GuardarDiagnosticoEspecialistaInput {
  especialistaId: string;
  diagnostico: string;
  nota?: string;
}

export interface CrearValidacionInput {
  prediccionId: string;
  resultadoFinal: ResultadoClinico;
  nota?: string;
}

export interface PrediccionProbabilidad {
  etiqueta: string;
  porcentaje: number;
}

export interface Caso {
  id: string;
  pacienteId: string;
  pacienteNombre: string;
  especialistaId: string;
  especialistaNombre: string;
  estado: EstadoCaso;
  diagnosticosCount: number;
  imagenesCount: number;

  estadoLabel: string;
  estadoColor: string;

  creado: Date;
  actualizado: Date;
}

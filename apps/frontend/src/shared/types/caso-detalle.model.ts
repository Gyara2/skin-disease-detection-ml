import type {
  EstadoCaso,
  EstadoPrediccion,
  EstadoValidacion,
  PrediccionProbabilidad,
  ResultadoClinico,
} from './caso.model';

export interface UsuarioCaso {
  id: string;
  nombreCompleto: string;
}

export interface ImagenCaso {
  id: string;
  nombreArchivo: string | null;
  storageKey: string | null;
  mimeType: string | null;
  size: number | null;
  uploadedAt: Date | null;
  src: string | null;
  prediccion: ImagenPrediccionCaso | null;
}

export interface ImagenPrediccionCaso {
  id: string;
  modeloVersion: string | null;
  resultado: Record<string, number>;
  creado: Date | null;
}

export interface DiagnosticoEspecialistaCaso {
  diagnostico: string;
  nota: string | null;
  creado: Date | null;
  actualizado: Date | null;
  especialistaId: string | null;
  especialistaNombre: string | null;
}

export interface ValidacionCaso {
  id: string;
  prediccionId: string | null;
  especialistaId: string | null;
  estado: EstadoValidacion;
  resultadoFinal: ResultadoClinico | null;
  nota: string | null;
  creado: Date | null;
  actualizado: Date | null;
  resumen: string | null;
}

export interface PrediccionCaso {
  id: string;
  diagnosticoId: string | null;
  estado: EstadoPrediccion;
  probabilidades: PrediccionProbabilidad[];
  creado: Date | null;
  modelo: string | null;
  modeloVersion: string | null;
  resumen: string | null;
  validaciones: ValidacionCaso[];
}

export interface Diagnostico {
  id: string;
  casoId: string | null;
  imagenId: string;
  imagen: ImagenCaso | null;
  nota: string;
  creado: Date;
  predicciones: PrediccionCaso[];
}

export interface CasoDetalle {
  id: string;
  estado: EstadoCaso;
  estadoLabel: string;
  estadoColor: string;
  paciente: UsuarioCaso;
  especialista: UsuarioCaso;
  diagnosticos: Diagnostico[];
  diagnosticoEspecialista: DiagnosticoEspecialistaCaso | null;
  imagenes: ImagenCaso[];
  creado: Date;
  actualizado: Date;
}

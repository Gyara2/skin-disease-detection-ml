export type EstadoCaso = 'pendiente' | 'en_proceso' | 'completado';

export interface CasoDTO {
  id: string;
  paciente_id: string;
  especialista_id: string;
  estado: EstadoCaso;
  creado: string;
  actualizado: string;
}

export interface Caso {
  id: string;
  pacienteId: string;
  pacienteNombre: string;
  especialistaId: string;
  especialistaNombre: string;
  estado: EstadoCaso;
  estadoLabel: string;
  estadoColor: string;
  creado: Date;
}

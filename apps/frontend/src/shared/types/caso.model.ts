export type EstadoCaso = 'pendiente' | 'en_proceso' | 'completado';

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

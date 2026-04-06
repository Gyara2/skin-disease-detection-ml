import type { EstadoCaso } from './caso.model';

export interface UsuarioCaso {
  id: string;
  nombreCompleto: string;
}

export interface Diagnostico {
  id: string;
  nota: string;
  creado: Date;
}

export interface CasoDetalle {
  id: string;
  estado: EstadoCaso;
  estadoLabel: string;
  estadoColor: string;
  paciente: UsuarioCaso;
  especialista: UsuarioCaso;
  diagnosticos: Diagnostico[];
  creado: Date;
}

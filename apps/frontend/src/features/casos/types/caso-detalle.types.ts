import type { EstadoCaso } from './caso.types';

export interface UsuarioDTO {
  id: string;
  nombre: string;
  apellido1: string;
  apellido2: string;
}

export interface DiagnosticoDTO {
  id: string;
  nota: string;
  creado: string;
}

export interface CasoDetalleDTO {
  id: string;
  estado: EstadoCaso;
  creado: string;
  paciente: UsuarioDTO;
  especialista: UsuarioDTO;
  diagnosticos: DiagnosticoDTO[];
}

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

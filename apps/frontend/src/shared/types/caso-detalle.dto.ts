import type { EstadoCaso } from './caso.model';

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

import type { EstadoCaso } from './caso.model';
import type { PrediccionDTO } from './caso.dto';

export interface UsuarioDTO {
  id: string;
  nombre: string;
  apellido1: string;
  apellido2: string;
}

export interface ImagenDTO {
  id: string;
  storage_key?: string | null;
  mime_type?: string | null;
  size?: number | null;
  uploaded_at?: string | null;
  src?: string | null;
}

export interface DiagnosticoDTO {
  id: string;
  caso_id?: string;
  imagen_id: string;
  imagen?: ImagenDTO | null;
  nota: string;
  creado: string;
  predicciones?: PrediccionDTO[] | null;
}

export interface CasoDetalleDTO {
  id: string;
  estado: EstadoCaso;
  creado: string;
  actualizado: string;
  paciente: UsuarioDTO;
  especialista: UsuarioDTO;
  diagnosticos: DiagnosticoDTO[];
}

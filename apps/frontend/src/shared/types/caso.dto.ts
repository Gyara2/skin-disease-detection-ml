import type { EstadoCaso } from './caso.model';

export interface CasoDTO {
  id: string;
  paciente_id: string;
  especialista_id: string;
  estado: EstadoCaso;
  creado: string;
  actualizado: string;
}

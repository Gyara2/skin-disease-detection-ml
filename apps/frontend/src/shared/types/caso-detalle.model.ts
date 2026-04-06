export interface Usuario {
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
  estado: string;
  estadoLabel: string;
  estadoColor: string;

  paciente: Usuario;
  especialista: Usuario;

  diagnosticos: Diagnostico[];

  creado: Date;
}

export type Rol = 'PACIENTE' | 'ESPECIALISTA' | 'ADMIN';

export interface Usuario {
  id: string;
  nombre: string;
  rol: Rol;
}

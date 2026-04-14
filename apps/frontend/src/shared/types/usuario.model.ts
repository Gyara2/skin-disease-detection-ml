export type Rol = 'PACIENTE' | 'ESPECIALISTA' | 'ADMIN';
export type RolGestionable = Exclude<Rol, 'ADMIN'>;

export const ROL_ID_BY_ROL: Record<Rol, string> = {
  ADMIN: 'rol-admin',
  ESPECIALISTA: 'rol-especialista',
  PACIENTE: 'rol-paciente',
};

export interface Usuario {
  id: string;
  dni: string;
  nombre: string;
  apellido1: string;
  apellido2: string;
  email: string;
  rol: Rol;
  rolId: string;
  creado: string;
  actualizado: string;
}

export interface CrearUsuarioInput {
  dni: string;
  nombre: string;
  apellido1: string;
  apellido2: string;
  email: string;
  rol: RolGestionable;
}

export interface AsignarRolUsuarioInput {
  rol: Rol;
}

export const getUsuarioNombreCompleto = (
  usuario: Pick<Usuario, 'nombre' | 'apellido1' | 'apellido2'>,
) => {
  return [usuario.nombre, usuario.apellido1, usuario.apellido2]
    .map((item) => item.trim())
    .filter(Boolean)
    .join(' ');
};

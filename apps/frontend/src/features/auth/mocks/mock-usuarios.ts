import type { Usuario } from '../store/auth.store';

export const mockUsuarios: Usuario[] = [
  {
    id: 'p1',
    nombre: 'Juan Perez Garcia',
    rol: 'PACIENTE',
  },
  {
    id: 'e1',
    nombre: 'Dra. Laura Lopez Martin',
    rol: 'ESPECIALISTA',
  },
  {
    id: 'admin-1',
    nombre: 'Administracion del sistema',
    rol: 'ADMIN',
  },
];

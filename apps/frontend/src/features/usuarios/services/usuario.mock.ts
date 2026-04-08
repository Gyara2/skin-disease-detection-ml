import type { Usuario } from '@/shared/types';

export const mockUsuarios: Usuario[] = [
  {
    id: 'admin-1',
    nombre: 'Administracion del sistema',
    rol: 'ADMIN',
  },
  {
    id: 'e1',
    nombre: 'Dra. Laura Lopez Martin',
    rol: 'ESPECIALISTA',
  },
  {
    id: 'e2',
    nombre: 'Dr. Carlos Navarro Gil',
    rol: 'ESPECIALISTA',
  },
  {
    id: 'e3',
    nombre: 'Dra. Elena Ruiz Serrano',
    rol: 'ESPECIALISTA',
  },
  {
    id: 'p1',
    nombre: 'Juan Perez Garcia',
    rol: 'PACIENTE',
  },
  {
    id: 'p2',
    nombre: 'Maria Sanchez Ruiz',
    rol: 'PACIENTE',
  },
  {
    id: 'p3',
    nombre: 'Carmen Ortega Diaz',
    rol: 'PACIENTE',
  },
  {
    id: 'p4',
    nombre: 'Luis Romero Vega',
    rol: 'PACIENTE',
  },
  {
    id: 'p5',
    nombre: 'Ana Torres Molina',
    rol: 'PACIENTE',
  },
  {
    id: 'p6',
    nombre: 'Sergio Marin Costa',
    rol: 'PACIENTE',
  },
];

export const getUsuariosFromMock = async (): Promise<Usuario[]> => {
  return mockUsuarios;
};

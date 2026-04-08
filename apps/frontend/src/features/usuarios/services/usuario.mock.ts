import type {
  AsignarRolUsuarioInput,
  CrearUsuarioInput,
  Usuario,
} from '@/shared/types';
import { ROL_ID_BY_ROL as rolIdByRol, getUsuarioNombreCompleto } from '@/shared/types';

export const mockUsuarios: Usuario[] = [
  {
    id: 'admin-1',
    dni: '00000000A',
    nombre: 'Administración',
    apellido1: 'del',
    apellido2: 'sistema',
    email: 'admin@skindiseaseml.local',
    rol: 'ADMIN',
    rolId: rolIdByRol.ADMIN,
    creado: '2024-01-01T00:00:00.000Z',
    actualizado: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'e1',
    dni: '10000001B',
    nombre: 'Laura',
    apellido1: 'López',
    apellido2: 'Martin',
    email: 'laura.lopez@skindiseaseml.local',
    rol: 'ESPECIALISTA',
    rolId: rolIdByRol.ESPECIALISTA,
    creado: '2024-01-02T00:00:00.000Z',
    actualizado: '2024-01-02T00:00:00.000Z',
  },
  {
    id: 'e2',
    dni: '10000002C',
    nombre: 'Carlos',
    apellido1: 'Navarro',
    apellido2: 'Gil',
    email: 'carlos.navarro@skindiseaseml.local',
    rol: 'ESPECIALISTA',
    rolId: rolIdByRol.ESPECIALISTA,
    creado: '2024-01-02T00:00:00.000Z',
    actualizado: '2024-01-02T00:00:00.000Z',
  },
  {
    id: 'e3',
    dni: '10000003D',
    nombre: 'Elena',
    apellido1: 'Ruiz',
    apellido2: 'Serrano',
    email: 'elena.ruiz@skindiseaseml.local',
    rol: 'ESPECIALISTA',
    rolId: rolIdByRol.ESPECIALISTA,
    creado: '2024-01-02T00:00:00.000Z',
    actualizado: '2024-01-02T00:00:00.000Z',
  },
  {
    id: 'p1',
    dni: '20000001E',
    nombre: 'Juan',
    apellido1: 'Pérez',
    apellido2: 'García',
    email: 'juan.perez@skindiseaseml.local',
    rol: 'PACIENTE',
    rolId: rolIdByRol.PACIENTE,
    creado: '2024-01-03T00:00:00.000Z',
    actualizado: '2024-01-03T00:00:00.000Z',
  },
  {
    id: 'p2',
    dni: '20000002F',
    nombre: 'Maria',
    apellido1: 'Sánchez',
    apellido2: 'Ruiz',
    email: 'maria.sanchez@skindiseaseml.local',
    rol: 'PACIENTE',
    rolId: rolIdByRol.PACIENTE,
    creado: '2024-01-03T00:00:00.000Z',
    actualizado: '2024-01-03T00:00:00.000Z',
  },
  {
    id: 'p3',
    dni: '20000003G',
    nombre: 'Carmen',
    apellido1: 'Ortega',
    apellido2: 'Díaz',
    email: 'carmen.ortega@skindiseaseml.local',
    rol: 'PACIENTE',
    rolId: rolIdByRol.PACIENTE,
    creado: '2024-01-03T00:00:00.000Z',
    actualizado: '2024-01-03T00:00:00.000Z',
  },
  {
    id: 'p4',
    dni: '20000004H',
    nombre: 'Luis',
    apellido1: 'Romero',
    apellido2: 'Vega',
    email: 'luis.romero@skindiseaseml.local',
    rol: 'PACIENTE',
    rolId: rolIdByRol.PACIENTE,
    creado: '2024-01-03T00:00:00.000Z',
    actualizado: '2024-01-03T00:00:00.000Z',
  },
  {
    id: 'p5',
    dni: '20000005I',
    nombre: 'Ana',
    apellido1: 'Torres',
    apellido2: 'Molina',
    email: 'ana.torres@skindiseaseml.local',
    rol: 'PACIENTE',
    rolId: rolIdByRol.PACIENTE,
    creado: '2024-01-03T00:00:00.000Z',
    actualizado: '2024-01-03T00:00:00.000Z',
  },
  {
    id: 'p6',
    dni: '20000006J',
    nombre: 'Sergio',
    apellido1: 'Marín',
    apellido2: 'Costa',
    email: 'sergio.marin@skindiseaseml.local',
    rol: 'PACIENTE',
    rolId: rolIdByRol.PACIENTE,
    creado: '2024-01-03T00:00:00.000Z',
    actualizado: '2024-01-03T00:00:00.000Z',
  },
];

const normalizeNombre = (value: string) => {
  return value.trim().replace(/\s+/g, ' ');
};

const getComparableNombre = (value: string) => {
  return normalizeNombre(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

const generarUsuarioId = (rol: CrearUsuarioInput['rol']) => {
  const prefix = rol === 'PACIENTE' ? 'p' : 'e';
  const randomPart = globalThis.crypto?.randomUUID?.() ??
    Math.random().toString(16).slice(2, 10);

  return `${prefix}-${randomPart}`;
};

const cloneUsuario = (usuario: Usuario): Usuario => ({ ...usuario });

const normalizeDni = (value: string) => value.trim().toUpperCase();
const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const getUsuariosFromMock = async (): Promise<Usuario[]> => {
  return mockUsuarios.map(cloneUsuario);
};

export const crearUsuarioFromMock = async (
  input: CrearUsuarioInput,
): Promise<Usuario> => {
  const nombre = normalizeNombre(input.nombre);
  const apellido1 = normalizeNombre(input.apellido1);
  const apellido2 = normalizeNombre(input.apellido2);
  const dni = normalizeDni(input.dni);
  const email = normalizeEmail(input.email);

  if (!dni || !nombre || !apellido1 || !email) {
    throw new Error('DNI, nombre, primer apellido y email son obligatorios');
  }

  if (!/^\d{8}[A-Z]$/.test(dni)) {
    throw new Error('El DNI debe seguir el formato 12345678A');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('El email no tiene un formato válido');
  }

  const nombreCompletoComparable = getComparableNombre(
    `${nombre} ${apellido1} ${apellido2}`,
  );
  const yaExisteUsuario = mockUsuarios.some((usuario) => {
    const usuarioNombreComparable = getComparableNombre(
      getUsuarioNombreCompleto(usuario),
    );

    return (
      usuarioNombreComparable === nombreCompletoComparable ||
      normalizeDni(usuario.dni) === dni ||
      normalizeEmail(usuario.email) === email
    );
  });

  if (yaExisteUsuario) {
    throw new Error('Ya existe un usuario con el mismo nombre, DNI o email');
  }

  const now = new Date().toISOString();

  const nuevoUsuario: Usuario = {
    id: generarUsuarioId(input.rol),
    dni,
    nombre,
    apellido1,
    apellido2,
    email,
    rol: input.rol,
    rolId: rolIdByRol[input.rol],
    creado: now,
    actualizado: now,
  };

  mockUsuarios.push(nuevoUsuario);

  return cloneUsuario(nuevoUsuario);
};

export const asignarRolUsuarioFromMock = async (
  usuarioId: string,
  input: AsignarRolUsuarioInput,
): Promise<Usuario> => {
  const usuario = mockUsuarios.find((item) => item.id === usuarioId);

  if (!usuario) {
    throw new Error('No se encontró el usuario seleccionado');
  }

  if (usuario.id === 'admin-1' && input.rol !== 'ADMIN') {
    throw new Error('No se puede modificar el rol del administrador principal');
  }

  usuario.rol = input.rol;
  usuario.rolId = rolIdByRol[input.rol];
  usuario.actualizado = new Date().toISOString();

  return cloneUsuario(usuario);
};

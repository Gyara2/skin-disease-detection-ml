import type { CasoDTO, CasoDetalleDTO } from '@/shared/types';

export const mockCasos: CasoDTO[] = [
  {
    id: '1',
    paciente_id: 'p1',
    especialista_id: 'e1',
    estado: 'pendiente',
    creado: '2024-01-01',
    actualizado: '2024-01-02',
  },
  {
    id: '2',
    paciente_id: 'p2',
    especialista_id: 'e2',
    estado: 'en_proceso',
    creado: '2024-01-10',
    actualizado: '2024-01-11',
  },
  {
    id: '3',
    paciente_id: 'p1',
    especialista_id: 'e1',
    estado: 'completado',
    creado: '2024-02-05',
    actualizado: '2024-02-08',
  },
  {
    id: '4',
    paciente_id: 'p3',
    especialista_id: 'e1',
    estado: 'pendiente',
    creado: '2024-02-18',
    actualizado: '2024-02-18',
  },
  {
    id: '5',
    paciente_id: 'p4',
    especialista_id: 'e3',
    estado: 'completado',
    creado: '2024-03-03',
    actualizado: '2024-03-06',
  },
  {
    id: '6',
    paciente_id: 'p1',
    especialista_id: 'e1',
    estado: 'en_proceso',
    creado: '2024-03-12',
    actualizado: '2024-03-14',
  },
  {
    id: '7',
    paciente_id: 'p5',
    especialista_id: 'e2',
    estado: 'pendiente',
    creado: '2024-03-28',
    actualizado: '2024-03-28',
  },
  {
    id: '8',
    paciente_id: 'p6',
    especialista_id: 'e3',
    estado: 'completado',
    creado: '2024-04-04',
    actualizado: '2024-04-09',
  },
];

export const mockCasoDetalleById: Record<string, CasoDetalleDTO> = {
  '1': {
    id: '1',
    estado: 'pendiente',
    creado: '2024-01-01',
    paciente: {
      id: 'p1',
      nombre: 'Juan',
      apellido1: 'Perez',
      apellido2: 'Garcia',
    },
    especialista: {
      id: 'e1',
      nombre: 'Dra. Laura',
      apellido1: 'Lopez',
      apellido2: 'Martin',
    },
    diagnosticos: [
      {
        id: 'd1',
        nota: 'Posible lesion benigna. Se recomienda seguimiento fotografico.',
        creado: '2024-01-02',
      },
    ],
  },
  '2': {
    id: '2',
    estado: 'en_proceso',
    creado: '2024-01-10',
    paciente: {
      id: 'p2',
      nombre: 'Maria',
      apellido1: 'Sanchez',
      apellido2: 'Ruiz',
    },
    especialista: {
      id: 'e2',
      nombre: 'Dr. Carlos',
      apellido1: 'Navarro',
      apellido2: 'Gil',
    },
    diagnosticos: [
      {
        id: 'd2',
        nota: 'Pendiente de revisar dermatoscopia y correlacion clinica.',
        creado: '2024-01-11',
      },
      {
        id: 'd3',
        nota: 'Solicitada segunda valoracion por la evolucion reportada.',
        creado: '2024-01-12',
      },
    ],
  },
  '3': {
    id: '3',
    estado: 'completado',
    creado: '2024-02-05',
    paciente: {
      id: 'p1',
      nombre: 'Juan',
      apellido1: 'Perez',
      apellido2: 'Garcia',
    },
    especialista: {
      id: 'e1',
      nombre: 'Dra. Laura',
      apellido1: 'Lopez',
      apellido2: 'Martin',
    },
    diagnosticos: [
      {
        id: 'd4',
        nota: 'Lesion compatible con queratosis seborreica. No se aprecian signos de alarma en la imagen enviada.',
        creado: '2024-02-06',
      },
      {
        id: 'd5',
        nota: 'Caso cerrado tras revision clinica. Se recomienda seguimiento habitual y volver a consultar si cambia el aspecto.',
        creado: '2024-02-08',
      },
    ],
  },
  '4': {
    id: '4',
    estado: 'pendiente',
    creado: '2024-02-18',
    paciente: {
      id: 'p3',
      nombre: 'Carmen',
      apellido1: 'Ortega',
      apellido2: 'Diaz',
    },
    especialista: {
      id: 'e1',
      nombre: 'Dra. Laura',
      apellido1: 'Lopez',
      apellido2: 'Martin',
    },
    diagnosticos: [],
  },
  '5': {
    id: '5',
    estado: 'completado',
    creado: '2024-03-03',
    paciente: {
      id: 'p4',
      nombre: 'Luis',
      apellido1: 'Romero',
      apellido2: 'Vega',
    },
    especialista: {
      id: 'e3',
      nombre: 'Dra. Elena',
      apellido1: 'Ruiz',
      apellido2: 'Serrano',
    },
    diagnosticos: [
      {
        id: 'd6',
        nota: 'Nevus melanocitico estable. Se documenta la imagen y se cierra el caso sin hallazgos de riesgo inmediato.',
        creado: '2024-03-04',
      },
    ],
  },
  '6': {
    id: '6',
    estado: 'en_proceso',
    creado: '2024-03-12',
    paciente: {
      id: 'p1',
      nombre: 'Juan',
      apellido1: 'Perez',
      apellido2: 'Garcia',
    },
    especialista: {
      id: 'e1',
      nombre: 'Dra. Laura',
      apellido1: 'Lopez',
      apellido2: 'Martin',
    },
    diagnosticos: [
      {
        id: 'd7',
        nota: 'Se solicita una segunda imagen con mejor iluminacion para confirmar el patron pigmentario observado.',
        creado: '2024-03-13',
      },
    ],
  },
  '7': {
    id: '7',
    estado: 'pendiente',
    creado: '2024-03-28',
    paciente: {
      id: 'p5',
      nombre: 'Ana',
      apellido1: 'Torres',
      apellido2: 'Molina',
    },
    especialista: {
      id: 'e2',
      nombre: 'Dr. Carlos',
      apellido1: 'Navarro',
      apellido2: 'Gil',
    },
    diagnosticos: [],
  },
  '8': {
    id: '8',
    estado: 'completado',
    creado: '2024-04-04',
    paciente: {
      id: 'p6',
      nombre: 'Sergio',
      apellido1: 'Marin',
      apellido2: 'Costa',
    },
    especialista: {
      id: 'e3',
      nombre: 'Dra. Elena',
      apellido1: 'Ruiz',
      apellido2: 'Serrano',
    },
    diagnosticos: [
      {
        id: 'd8',
        nota: 'Imagen compatible con lesion inflamatoria superficial. Evolucion favorable tras tratamiento topico indicado.',
        creado: '2024-04-05',
      },
      {
        id: 'd9',
        nota: 'Revision final completada. Se cierra el expediente y se recomienda seguimiento si reaparecen sintomas.',
        creado: '2024-04-09',
      },
    ],
  },
};

export const getCasosFromMock = async (): Promise<CasoDTO[]> => {
  return mockCasos;
};

export const getCasoDetalleFromMock = async (
  id: string,
): Promise<CasoDetalleDTO | undefined> => {
  return mockCasoDetalleById[id];
};

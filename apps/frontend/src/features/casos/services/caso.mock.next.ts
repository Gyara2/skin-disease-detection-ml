import { mockUsuarios } from '@/features/usuarios/services/usuario.mock';
import type {
  ActualizarEstadoCasoInput,
  CasoDTO,
  CasoDetalleDTO,
  CrearCasoInput,
  CrearDiagnosticoInput,
  CrearValidacionInput,
  DiagnosticoDTO,
  EstadoCaso,
  ImagenDTO,
  PrediccionDTO,
  PrediccionProbabilidadDTO,
  ResultadoClinico,
  UsuarioDTO,
  ValidacionDTO,
} from '@/shared/types';

interface MockDiagnosticoSeed {
  id: string;
  imagenId: string;
  imagenSrc?: string;
  nota: string;
  creado: string;
  predicciones: PrediccionDTO[];
}

interface MockCaseSeed {
  id: string;
  pacienteId: string;
  especialistaId: string;
  estado: EstadoCaso;
  creado: string;
  actualizado: string;
  diagnosticos: MockDiagnosticoSeed[];
}

const PREDICCION_LABELS = [
  'Nevus melanocitico',
  'Queratosis seborreica',
  'Lentigo solar',
  'Dermatitis',
  'Psoriasis',
  'Varicela',
  'Rosacea',
  'Melanoma',
  'Carcinoma basocelular',
  'Queratosis actinica',
  'Imagen insuficiente',
  'Captura no concluyente',
  'Lesion a revisar',
] as const;

const buildUsuarioFromNombreCompleto = (
  id: string,
  nombreCompleto: string,
): UsuarioDTO => {
  const [nombre, apellido1 = '', ...restoApellidos] = nombreCompleto.split(' ');

  return {
    id,
    nombre,
    apellido1,
    apellido2: restoApellidos.join(' '),
  };
};

const cloneUsuario = (usuario: UsuarioDTO): UsuarioDTO => ({
  ...usuario,
});

const cloneImagen = (imagen?: ImagenDTO | null): ImagenDTO | null => {
  return imagen ? { ...imagen } : null;
};

const clonePrediccionProbabilidad = (
  probabilidad: PrediccionProbabilidadDTO,
): PrediccionProbabilidadDTO => ({
  ...probabilidad,
});

const cloneValidacion = (
  validacion?: ValidacionDTO | null,
): ValidacionDTO | null => {
  return validacion ? { ...validacion } : null;
};

const clonePrediccion = (
  prediccion?: PrediccionDTO | null,
): PrediccionDTO | null => {
  return prediccion
    ? {
        ...prediccion,
        probabilidades:
          prediccion.probabilidades?.map(clonePrediccionProbabilidad) ?? [],
        validaciones:
          prediccion.validaciones?.map((item) => cloneValidacion(item)!) ?? [],
      }
    : null;
};

const cloneDiagnostico = (diagnostico: DiagnosticoDTO): DiagnosticoDTO => ({
  ...diagnostico,
  imagen: cloneImagen(diagnostico.imagen),
  predicciones:
    diagnostico.predicciones?.map((item) => clonePrediccion(item)!) ?? [],
});

const cloneCaso = (caso: CasoDTO): CasoDTO => ({
  ...caso,
});

const cloneCasoDetalle = (caso: CasoDetalleDTO): CasoDetalleDTO => ({
  ...caso,
  paciente: cloneUsuario(caso.paciente),
  especialista: cloneUsuario(caso.especialista),
  diagnosticos: caso.diagnosticos.map(cloneDiagnostico),
});

const getUsuarioDetalleById = (usuarioId: string): UsuarioDTO => {
  const usuario = mockUsuarios.find((item) => item.id === usuarioId);

  if (!usuario) {
    throw new Error('No se ha encontrado el usuario indicado');
  }

  return buildUsuarioFromNombreCompleto(usuario.id, usuario.nombre);
};

const assertUsuarioRol = (
  usuarioId: string,
  rol: 'PACIENTE' | 'ESPECIALISTA',
) => {
  const usuario = mockUsuarios.find((item) => item.id === usuarioId);

  if (!usuario || usuario.rol !== rol) {
    throw new Error(`El usuario seleccionado no tiene rol ${rol.toLowerCase()}`);
  }
};

const generateMockId = (prefix: string) => {
  const randomPart =
    globalThis.crypto?.randomUUID?.().slice(0, 8) ??
    Math.random().toString(16).slice(2, 10);

  return `${prefix}-${randomPart}`;
};

const createProbabilidades = (
  ...items: Array<[etiqueta: string, porcentaje: number]>
): PrediccionProbabilidadDTO[] =>
  items.map(([etiqueta, porcentaje]) => ({
    etiqueta,
    porcentaje,
  }));

const formatPrediccionResumen = (
  estado: PrediccionDTO['estado'],
  probabilidades: PrediccionProbabilidadDTO[],
) => {
  if (!probabilidades.length) {
    if (estado === 'error') {
      return 'La prediccion automatica no pudo completarse.';
    }

    if (estado === 'pendiente') {
      return 'Prediccion pendiente de generarse.';
    }

    return 'Prediccion disponible sin probabilidades asociadas.';
  }

  const topTres = probabilidades
    .slice(0, 3)
    .map((item) => `${item.porcentaje}% ${item.etiqueta}`)
    .join(', ');

  return `Top 3 sugerido por el modelo: ${topTres}.`;
};

const createValidacion = ({
  prediccionId,
  especialistaId,
  estado,
  resultadoFinal,
  creado,
  nota,
  resumen,
}: {
  prediccionId: string;
  especialistaId: string;
  estado: ValidacionDTO['estado'];
  resultadoFinal?: ResultadoClinico | null;
  creado: string;
  nota?: string | null;
  resumen?: string | null;
}): ValidacionDTO => ({
  id: generateMockId('val'),
  prediccion_id: prediccionId,
  especialista_id: especialistaId,
  estado,
  resultado_final: resultadoFinal ?? null,
  nota: nota ?? null,
  creado,
  actualizado: creado,
  resumen:
    resumen ??
    (estado === 'pendiente'
      ? 'Pendiente de comparar la prediccion automatica con el criterio clinico.'
      : 'Validacion completada.'),
});

const createPrediccion = ({
  diagnosticoId,
  estado,
  probabilidades,
  creado,
  resumen,
  validaciones = [],
}: {
  diagnosticoId: string;
  estado: PrediccionDTO['estado'];
  probabilidades?: PrediccionProbabilidadDTO[] | null;
  creado: string;
  resumen?: string | null;
  validaciones?: ValidacionDTO[];
}): PrediccionDTO => {
  const probabilidadesOrdenadas = [...(probabilidades ?? [])]
    .sort((a, b) => b.porcentaje - a.porcentaje)
    .slice(0, 3)
    .map(clonePrediccionProbabilidad);

  return {
    id: generateMockId('pred'),
    diagnostico_id: diagnosticoId,
    estado,
    probabilidades: probabilidadesOrdenadas,
    creado,
    modelo: 'DermAssist',
    modelo_version: 'v2.1',
    resumen:
      resumen ?? formatPrediccionResumen(estado, probabilidadesOrdenadas),
    validaciones: validaciones.map((item) => cloneValidacion(item)!),
  };
};

const buildAutomaticPrediction = (
  predictionSeed: string,
  diagnosticoId: string,
  creado: string,
): PrediccionDTO => {
  const checksum = predictionSeed
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0);
  const etiquetas: string[] = [];
  let cursor = checksum % PREDICCION_LABELS.length;

  while (etiquetas.length < 3) {
    const etiqueta = PREDICCION_LABELS[cursor % PREDICCION_LABELS.length];

    if (!etiquetas.includes(etiqueta)) {
      etiquetas.push(etiqueta);
    }

    cursor += 3;
  }

  const rawScores = [
    58 + (checksum % 17),
    24 + (Math.floor(checksum / 7) % 12),
    11 + (Math.floor(checksum / 17) % 10),
  ];
  const total = rawScores.reduce((sum, value) => sum + value, 0);
  const porcentajePrincipal = Math.round((rawScores[0] * 100) / total);
  const porcentajeSecundario = Math.round((rawScores[1] * 100) / total);
  const porcentajeTerciario = 100 - porcentajePrincipal - porcentajeSecundario;

  return createPrediccion({
    diagnosticoId,
    estado: 'lista',
    probabilidades: createProbabilidades(
      [etiquetas[0], porcentajePrincipal],
      [etiquetas[1], porcentajeSecundario],
      [etiquetas[2], porcentajeTerciario],
    ),
    creado,
    resumen: 'Prediccion generada automaticamente a partir de la imagen recibida.',
  });
};

const normalizeBase64Input = (value: string) => value.replace(/\s+/g, '');

const buildImageIdFromBase64 = (base64: string) => {
  const checksum = base64
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0);

  return `img-${checksum.toString(16).padStart(8, '0').slice(-8)}`;
};

const buildMockImagePreview = (seed: string) => {
  const checksum = seed
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0);
  const hueBase = checksum % 360;
  const hueAccent = (hueBase + 34) % 360;
  const hueDark = (hueBase + 210) % 360;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" fill="none">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="hsl(${hueBase} 55% 88%)" />
          <stop offset="100%" stop-color="hsl(${hueAccent} 44% 80%)" />
        </linearGradient>
      </defs>
      <rect width="320" height="240" rx="28" fill="url(#bg)" />
      <circle cx="164" cy="121" r="68" fill="hsl(${hueDark} 35% 44%)" opacity="0.22" />
      <circle cx="152" cy="115" r="54" fill="hsl(${hueDark} 38% 38%)" opacity="0.46" />
      <circle cx="174" cy="126" r="26" fill="hsl(${hueDark} 32% 28%)" opacity="0.24" />
      <path d="M88 168c18-19 45-30 69-30 35 0 58 15 78 35" stroke="hsl(${hueDark} 28% 25%)" stroke-width="12" stroke-linecap="round" opacity="0.18" />
      <text x="24" y="214" fill="rgba(15,23,42,0.58)" font-size="18" font-family="Arial, sans-serif">${seed}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const buildImagenDTO = (imagenId: string, imagenSrc?: string): ImagenDTO => ({
  id: imagenId,
  storage_key: `mock/${imagenId}.jpg`,
  mime_type: 'image/jpeg',
  size: 128000,
  uploaded_at: new Date().toISOString(),
  src: imagenSrc ?? buildMockImagePreview(imagenId),
});

const buildDiagnosticoDTOFromSeed = (
  casoId: string,
  seed: MockDiagnosticoSeed,
): DiagnosticoDTO => ({
  id: seed.id,
  caso_id: casoId,
  imagen_id: seed.imagenId,
  imagen: buildImagenDTO(seed.imagenId, seed.imagenSrc),
  nota: seed.nota,
  creado: seed.creado,
  predicciones: seed.predicciones.map((item) => clonePrediccion(item)!),
});

const createDiagnosticoSeed = ({
  id,
  imagenId,
  imagenSrc,
  nota,
  creado,
  predicciones = [],
}: {
  id: string;
  imagenId: string;
  imagenSrc?: string;
  nota: string;
  creado: string;
  predicciones?: PrediccionDTO[];
}): MockDiagnosticoSeed => ({
  id,
  imagenId,
  imagenSrc,
  nota,
  creado,
  predicciones,
});

const mockCaseSeeds: MockCaseSeed[] = [
  {
    id: '1',
    pacienteId: 'p1',
    especialistaId: 'e1',
    estado: 'en_proceso',
    creado: '2024-01-01T09:10:00.000Z',
    actualizado: '2024-01-02T11:45:00.000Z',
    diagnosticos: [
      createDiagnosticoSeed({
        id: 'd1',
        imagenId: 'img-lesion-001',
        nota: 'Posible lesion benigna. Se recomienda seguimiento fotografico.',
        creado: '2024-01-02T11:45:00.000Z',
        predicciones: [
          createPrediccion({
            diagnosticoId: 'd1',
            estado: 'lista',
            probabilidades: createProbabilidades(
              ['Queratosis seborreica', 52],
              ['Nevus melanocitico', 31],
              ['Lentigo solar', 17],
            ),
            creado: '2024-01-01T09:11:00.000Z',
            resumen:
              'La IA sugiere un patron benigno y recomienda seguimiento fotografico.',
          }),
        ],
      }),
    ],
  },
  {
    id: '2',
    pacienteId: 'p2',
    especialistaId: 'e2',
    estado: 'en_proceso',
    creado: '2024-01-10T08:20:00.000Z',
    actualizado: '2024-01-12T10:15:00.000Z',
    diagnosticos: [
      createDiagnosticoSeed({
        id: 'd2',
        imagenId: 'img-lesion-002',
        nota: 'Pendiente de revisar dermatoscopia y correlacion clinica.',
        creado: '2024-01-11T09:30:00.000Z',
        predicciones: [
          createPrediccion({
            diagnosticoId: 'd2',
            estado: 'lista',
            probabilidades: createProbabilidades(
              ['Imagen insuficiente', 37],
              ['Dermatitis', 34],
              ['Psoriasis', 29],
            ),
            creado: '2024-01-10T08:21:00.000Z',
            resumen:
              'La IA detecta una imagen con incertidumbre elevada y pide revision adicional.',
          }),
        ],
      }),
      createDiagnosticoSeed({
        id: 'd3',
        imagenId: 'img-lesion-002-b',
        nota: 'Solicitada segunda valoracion por la evolucion reportada.',
        creado: '2024-01-12T10:15:00.000Z',
        predicciones: [
          buildAutomaticPrediction(
            'img-lesion-002-b',
            'd3',
            '2024-01-12T10:16:00.000Z',
          ),
        ],
      }),
    ],
  },
  {
    id: '3',
    pacienteId: 'p1',
    especialistaId: 'e1',
    estado: 'completado',
    creado: '2024-02-05T12:00:00.000Z',
    actualizado: '2024-02-08T16:10:00.000Z',
    diagnosticos: [
      createDiagnosticoSeed({
        id: 'd4',
        imagenId: 'img-lesion-003',
        nota: 'Lesion compatible con queratosis seborreica. No se aprecian signos de alarma en la imagen enviada.',
        creado: '2024-02-06T15:20:00.000Z',
        predicciones: [
          (() => {
            const prediccion = createPrediccion({
              diagnosticoId: 'd4',
              estado: 'lista',
              probabilidades: createProbabilidades(
                ['Nevus melanocitico', 61],
                ['Queratosis seborreica', 24],
                ['Lentigo solar', 15],
              ),
              creado: '2024-02-05T12:01:00.000Z',
            });

            prediccion.validaciones = [
              createValidacion({
                prediccionId: prediccion.id ?? 'pred-d4',
                especialistaId: 'e1',
                estado: 'confirmada',
                resultadoFinal: 'benigno',
                creado: '2024-02-08T16:10:00.000Z',
                nota: 'La evaluacion clinica confirma la lectura automatica.',
                resumen:
                  'La evaluacion clinica confirma la prediccion automatica y se cierra el caso.',
              }),
            ];

            return prediccion;
          })(),
        ],
      }),
      createDiagnosticoSeed({
        id: 'd5',
        imagenId: 'img-lesion-003',
        nota: 'Caso cerrado tras revision clinica. Se recomienda seguimiento habitual y volver a consultar si cambia el aspecto.',
        creado: '2024-02-08T16:10:00.000Z',
      }),
    ],
  },
  {
    id: '4',
    pacienteId: 'p3',
    especialistaId: 'e1',
    estado: 'pendiente',
    creado: '2024-02-18T07:50:00.000Z',
    actualizado: '2024-02-18T07:51:00.000Z',
    diagnosticos: [
      createDiagnosticoSeed({
        id: 'd6',
        imagenId: 'img-lesion-004',
        nota: 'Imagen inicial registrada. Pendiente de valoracion clinica.',
        creado: '2024-02-18T07:51:00.000Z',
        predicciones: [
          createPrediccion({
            diagnosticoId: 'd6',
            estado: 'pendiente',
            creado: '2024-02-18T07:51:00.000Z',
            resumen:
              'La prediccion automatica sigue en cola tras el alta inicial del caso.',
          }),
        ],
      }),
    ],
  },
  {
    id: '5',
    pacienteId: 'p4',
    especialistaId: 'e3',
    estado: 'completado',
    creado: '2024-03-03T13:35:00.000Z',
    actualizado: '2024-03-06T18:00:00.000Z',
    diagnosticos: [
      createDiagnosticoSeed({
        id: 'd7',
        imagenId: 'img-lesion-005',
        nota: 'Nevus melanocitico estable. Se documenta la imagen y se cierra el caso sin hallazgos de riesgo inmediato.',
        creado: '2024-03-04T09:40:00.000Z',
        predicciones: [
          (() => {
            const prediccion = createPrediccion({
              diagnosticoId: 'd7',
              estado: 'lista',
              probabilidades: createProbabilidades(
                ['Dermatitis', 46],
                ['Psoriasis', 31],
                ['Rosacea', 23],
              ),
              creado: '2024-03-03T13:36:00.000Z',
            });

            prediccion.validaciones = [
              createValidacion({
                prediccionId: prediccion.id ?? 'pred-d7',
                especialistaId: 'e3',
                estado: 'ajustada',
                resultadoFinal: 'benigno',
                creado: '2024-03-06T18:00:00.000Z',
                nota: 'La evolucion clinica favorece un hallazgo benigno.',
                resumen:
                  'La validacion final corrige la sugerencia automatica y clasifica el caso como benigno.',
              }),
            ];

            return prediccion;
          })(),
        ],
      }),
    ],
  },
  {
    id: '6',
    pacienteId: 'p1',
    especialistaId: 'e1',
    estado: 'en_proceso',
    creado: '2024-03-12T10:10:00.000Z',
    actualizado: '2024-03-14T10:25:00.000Z',
    diagnosticos: [
      createDiagnosticoSeed({
        id: 'd8',
        imagenId: 'img-lesion-006',
        nota: 'Se solicita una segunda imagen con mejor iluminacion para confirmar el patron pigmentario observado.',
        creado: '2024-03-13T18:45:00.000Z',
        predicciones: [
          createPrediccion({
            diagnosticoId: 'd8',
            estado: 'lista',
            probabilidades: createProbabilidades(
              ['Melanoma', 49],
              ['Carcinoma basocelular', 29],
              ['Queratosis actinica', 22],
            ),
            creado: '2024-03-12T10:11:00.000Z',
          }),
        ],
      }),
    ],
  },
  {
    id: '7',
    pacienteId: 'p5',
    especialistaId: 'e2',
    estado: 'pendiente',
    creado: '2024-03-28T14:05:00.000Z',
    actualizado: '2024-03-28T14:07:00.000Z',
    diagnosticos: [
      createDiagnosticoSeed({
        id: 'd9',
        imagenId: 'img-lesion-007',
        nota: 'Imagen inicial registrada. Pendiente de nueva captura con mejor calidad.',
        creado: '2024-03-28T14:07:00.000Z',
        predicciones: [
          createPrediccion({
            diagnosticoId: 'd9',
            estado: 'error',
            creado: '2024-03-28T14:07:00.000Z',
            resumen:
              'La prediccion automatica no pudo completarse por calidad insuficiente de la imagen.',
          }),
        ],
      }),
    ],
  },
  {
    id: '8',
    pacienteId: 'p6',
    especialistaId: 'e3',
    estado: 'completado',
    creado: '2024-04-04T11:40:00.000Z',
    actualizado: '2024-04-09T17:00:00.000Z',
    diagnosticos: [
      createDiagnosticoSeed({
        id: 'd10',
        imagenId: 'img-lesion-008',
        nota: 'Imagen compatible con lesion inflamatoria superficial. Evolucion favorable tras tratamiento topico indicado.',
        creado: '2024-04-05T13:00:00.000Z',
        predicciones: [
          (() => {
            const prediccion = createPrediccion({
              diagnosticoId: 'd10',
              estado: 'lista',
              probabilidades: createProbabilidades(
                ['Varicela', 58],
                ['Dermatitis', 24],
                ['Psoriasis', 18],
              ),
              creado: '2024-04-04T11:41:00.000Z',
            });

            prediccion.validaciones = [
              createValidacion({
                prediccionId: prediccion.id ?? 'pred-d10',
                especialistaId: 'e3',
                estado: 'confirmada',
                resultadoFinal: 'inflamatorio',
                creado: '2024-04-09T17:00:00.000Z',
                nota: 'La clinica confirma el caracter inflamatorio del caso.',
                resumen:
                  'La validacion confirma la interpretacion automatica y se cierra el seguimiento.',
              }),
            ];

            return prediccion;
          })(),
        ],
      }),
      createDiagnosticoSeed({
        id: 'd11',
        imagenId: 'img-lesion-008',
        nota: 'Revision final completada. Se cierra el expediente y se recomienda seguimiento si reaparecen sintomas.',
        creado: '2024-04-09T17:00:00.000Z',
      }),
    ],
  },
];

const buildCasoDTOFromSeed = (seed: MockCaseSeed): CasoDTO => ({
  id: seed.id,
  paciente_id: seed.pacienteId,
  especialista_id: seed.especialistaId,
  estado: seed.estado,
  diagnosticos_count: seed.diagnosticos.length,
  creado: seed.creado,
  actualizado: seed.actualizado,
});

const buildCasoDetalleDTOFromSeed = (seed: MockCaseSeed): CasoDetalleDTO => ({
  id: seed.id,
  estado: seed.estado,
  creado: seed.creado,
  actualizado: seed.actualizado,
  paciente: getUsuarioDetalleById(seed.pacienteId),
  especialista: getUsuarioDetalleById(seed.especialistaId),
  diagnosticos: seed.diagnosticos.map((item) =>
    buildDiagnosticoDTOFromSeed(seed.id, item),
  ),
});

export const mockCasos: CasoDTO[] = mockCaseSeeds.map(buildCasoDTOFromSeed);

export const mockCasoDetalleById: Record<string, CasoDetalleDTO> =
  Object.fromEntries(
    mockCaseSeeds.map((seed) => [
      seed.id,
      buildCasoDetalleDTOFromSeed(seed),
    ]),
  );

export const getCasosFromMock = async (): Promise<CasoDTO[]> => {
  return mockCasos.map(cloneCaso);
};

export const getCasoDetalleFromMock = async (
  id: string,
): Promise<CasoDetalleDTO | undefined> => {
  const caso = mockCasoDetalleById[id];
  return caso ? cloneCasoDetalle(caso) : undefined;
};

const syncResumenConDetalle = (
  caso: CasoDTO,
  detalle: CasoDetalleDTO,
) => {
  caso.estado = detalle.estado;
  caso.diagnosticos_count = detalle.diagnosticos.length;
  caso.actualizado = detalle.actualizado;
};

const getPrediccionesOrdenadas = (detalle: CasoDetalleDTO) => {
  return detalle.diagnosticos
    .flatMap((diagnostico) => diagnostico.predicciones ?? [])
    .sort((a, b) => {
      const left = a.creado ? new Date(a.creado).getTime() : 0;
      const right = b.creado ? new Date(b.creado).getTime() : 0;
      return right - left;
    });
};

export const crearCasoFromMock = async (
  input: CrearCasoInput,
): Promise<CasoDetalleDTO> => {
  assertUsuarioRol(input.pacienteId, 'PACIENTE');
  assertUsuarioRol(input.especialistaId, 'ESPECIALISTA');

  const imagenBase64 = normalizeBase64Input(input.imagenBase64.trim());

  if (!imagenBase64) {
    throw new Error('Debes indicar la imagen en base64 que origina el caso');
  }

  const now = new Date().toISOString();
  const casoId = generateMockId('caso');
  const diagnosticoId = generateMockId('diag');
  const imagenId = buildImageIdFromBase64(imagenBase64);
  const prediccion = buildAutomaticPrediction(imagenBase64, diagnosticoId, now);

  const nuevoDetalle: CasoDetalleDTO = {
    id: casoId,
    estado: 'pendiente',
    creado: now,
    actualizado: now,
    paciente: getUsuarioDetalleById(input.pacienteId),
    especialista: getUsuarioDetalleById(input.especialistaId),
    diagnosticos: [
      {
        id: diagnosticoId,
        caso_id: casoId,
        imagen_id: imagenId,
        imagen: buildImagenDTO(imagenId, imagenBase64),
        nota: 'Imagen inicial registrada. Pendiente de valoracion clinica.',
        creado: now,
        predicciones: [clonePrediccion(prediccion)!],
      },
    ],
  };

  const nuevoCaso: CasoDTO = {
    id: casoId,
    paciente_id: input.pacienteId,
    especialista_id: input.especialistaId,
    estado: 'pendiente',
    diagnosticos_count: 1,
    creado: now,
    actualizado: now,
  };

  mockCasos.unshift(nuevoCaso);
  mockCasoDetalleById[casoId] = nuevoDetalle;

  return cloneCasoDetalle(nuevoDetalle);
};

export const actualizarEstadoCasoFromMock = async (
  casoId: string,
  input: ActualizarEstadoCasoInput,
): Promise<CasoDetalleDTO> => {
  const caso = mockCasos.find((item) => item.id === casoId);
  const detalle = mockCasoDetalleById[casoId];

  if (!caso || !detalle) {
    throw new Error('No se ha encontrado el caso solicitado');
  }

  const now = new Date().toISOString();

  if (input.estado === 'completado') {
    const tieneValidacion = getPrediccionesOrdenadas(detalle).some(
      (prediccion) => (prediccion.validaciones?.length ?? 0) > 0,
    );

    if (!tieneValidacion) {
      throw new Error('Debes registrar una validacion antes de completar el caso');
    }
  }

  detalle.estado = input.estado;
  detalle.actualizado = now;

  syncResumenConDetalle(caso, detalle);

  return cloneCasoDetalle(detalle);
};

export const crearValidacionFromMock = async (
  casoId: string,
  input: CrearValidacionInput,
): Promise<CasoDetalleDTO> => {
  const caso = mockCasos.find((item) => item.id === casoId);
  const detalle = mockCasoDetalleById[casoId];

  if (!caso || !detalle) {
    throw new Error('No se ha encontrado el caso solicitado');
  }

  const prediccionId = input.prediccionId.trim();

  if (!prediccionId) {
    throw new Error('Debes seleccionar una prediccion para registrar la validacion');
  }

  const prediccion = getPrediccionesOrdenadas(detalle).find(
    (item) => item.id === prediccionId,
  );

  if (!prediccion) {
    throw new Error('No se ha encontrado la prediccion indicada');
  }

  if (prediccion.estado !== 'lista') {
    throw new Error('Solo se pueden validar predicciones disponibles');
  }

  const now = new Date().toISOString();
  const nota = input.nota?.trim() ?? '';

  const nuevaValidacion = createValidacion({
    prediccionId,
    especialistaId: detalle.especialista.id,
    estado: 'confirmada',
    resultadoFinal: input.resultadoFinal,
    creado: now,
    nota: nota || null,
    resumen: 'Validacion clinica registrada por el especialista responsable.',
  });

  prediccion.validaciones = [
    nuevaValidacion,
    ...(prediccion.validaciones?.map((item) => cloneValidacion(item)!) ?? []),
  ];
  detalle.actualizado = now;

  syncResumenConDetalle(caso, detalle);

  return cloneCasoDetalle(detalle);
};

export const crearDiagnosticoFromMock = async (
  casoId: string,
  input: CrearDiagnosticoInput,
): Promise<CasoDetalleDTO> => {
  const caso = mockCasos.find((item) => item.id === casoId);
  const detalle = mockCasoDetalleById[casoId];

  if (!caso || !detalle) {
    throw new Error('No se ha encontrado el caso solicitado');
  }

  const imagenBase64 = normalizeBase64Input(input.imagenBase64.trim());
  const nota = input.nota.trim();

  if (!imagenBase64 || !nota) {
    throw new Error('Debes indicar una imagen y la nota clinica del diagnostico');
  }

  const now = new Date().toISOString();
  const diagnosticoId = generateMockId('diag');
  const imagenId = buildImageIdFromBase64(imagenBase64);
  const prediccion = buildAutomaticPrediction(imagenBase64, diagnosticoId, now);

  const nuevoDiagnostico: DiagnosticoDTO = {
    id: diagnosticoId,
    caso_id: casoId,
    imagen_id: imagenId,
    imagen: buildImagenDTO(imagenId, imagenBase64),
    nota,
    creado: now,
    predicciones: [prediccion],
  };

  detalle.diagnosticos.unshift(nuevoDiagnostico);
  detalle.actualizado = now;

  if (detalle.estado === 'pendiente') {
    detalle.estado = 'en_proceso';
  }

  syncResumenConDetalle(caso, detalle);

  return cloneCasoDetalle(detalle);
};

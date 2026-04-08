import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Filter,
  ImageIcon,
  LoaderCircle,
  Stethoscope,
  UserRound,
} from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { useCrearCaso } from '@/features/casos/hooks/useCrearCaso';
import { useCasos } from '@/features/casos/hooks/useCasos';
import { useUsuarios } from '@/features/usuarios/hooks/useUsuarios';
import { CustomSelect } from '@/shared/components/CustomSelect';
import { PaginationControls } from '@/shared/components/PaginationControls';
import {
  fileToImageBase64,
  validateImageFile,
} from '@/shared/lib/image-file';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';

const getErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  return error instanceof Error ? error.message : fallback;
};

const CASOS_POR_PAGINA = {
  PACIENTE: 6,
  ESPECIALISTA: 6,
  ADMIN: 8,
} as const;

const estadoFilterOptions = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'completado', label: 'Completado' },
] as const;

export const CasosPage = () => {
  const navigate = useNavigate();
  const { usuario, isAuthenticated } = useAuthStore();
  const { data, error, isLoading } = useCasos();
  const {
    data: usuarios = [],
    error: usuariosError,
    isLoading: isUsuariosLoading,
  } = useUsuarios();
  const crearCasoMutation = useCrearCaso();
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [especialistaFiltro, setEspecialistaFiltro] = useState('todos');
  const [nuevoCasoPacienteId, setNuevoCasoPacienteId] = useState('');
  const [nuevoCasoEspecialistaId, setNuevoCasoEspecialistaId] = useState('');
  const [nuevaImagenBase64, setNuevaImagenBase64] = useState('');
  const [nuevaImagenNombre, setNuevaImagenNombre] = useState('');
  const [imagenArchivoFeedback, setImagenArchivoFeedback] = useState<
    string | null
  >(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [crearCasoFeedback, setCrearCasoFeedback] = useState<string | null>(
    null,
  );

  const casos = data ?? [];
  const rolUsuario = usuario?.rol;
  const pacientesDisponibles = usuarios.filter(
    (item) => item.rol === 'PACIENTE',
  );
  const especialistasRegistrados = usuarios.filter(
    (item) => item.rol === 'ESPECIALISTA',
  );

  const casosPorRol =
    rolUsuario === 'PACIENTE'
      ? casos.filter((caso) => caso.pacienteId === usuario?.id)
      : rolUsuario === 'ESPECIALISTA'
        ? casos.filter((caso) => caso.especialistaId === usuario?.id)
        : casos;

  const especialistasDisponiblesEnCasos = Array.from(
    new Map(
      casos.map((caso) => [caso.especialistaId, caso.especialistaNombre]),
    ).entries(),
  );
  const pacientesOptions = pacientesDisponibles.map((paciente) => ({
    value: paciente.id,
    label: paciente.nombre,
  }));
  const especialistasOptions = especialistasRegistrados.map((especialista) => ({
    value: especialista.id,
    label: especialista.nombre,
  }));
  const especialistaFilterOptions = [
    { value: 'todos', label: 'Todos' },
    ...especialistasDisponiblesEnCasos.map(
      ([especialistaId, especialistaNombre]) => ({
        value: especialistaId,
        label: especialistaNombre,
      }),
    ),
  ];

  const casosVisibles = casosPorRol
    .filter((caso) =>
      estadoFiltro === 'todos' ? true : caso.estado === estadoFiltro,
    )
    .filter((caso) =>
      rolUsuario === 'ADMIN' && especialistaFiltro !== 'todos'
        ? caso.especialistaId === especialistaFiltro
        : true,
    )
    .sort((a, b) => b.creado.getTime() - a.creado.getTime());

  const casosPorPagina = rolUsuario
    ? CASOS_POR_PAGINA[rolUsuario]
    : CASOS_POR_PAGINA.ADMIN;
  const totalPaginas = Math.max(
    1,
    Math.ceil(casosVisibles.length / casosPorPagina),
  );
  const indiceInicio = (paginaActual - 1) * casosPorPagina;
  const casosPaginados = casosVisibles.slice(
    indiceInicio,
    indiceInicio + casosPorPagina,
  );
  const mostrarPaginacion = casosVisibles.length > casosPorPagina;

  const resumenAdmin = [
    {
      label: 'Total',
      value: casosVisibles.length,
      icon: ClipboardList,
    },
    {
      label: 'Pendientes',
      value: casosVisibles.filter((caso) => caso.estado === 'pendiente').length,
      icon: Filter,
    },
    {
      label: 'Completados',
      value: casosVisibles.filter((caso) => caso.estado === 'completado')
        .length,
      icon: CheckCircle2,
    },
  ];

  useEffect(() => {
    if (
      pacientesDisponibles.length &&
      !pacientesDisponibles.some((item) => item.id === nuevoCasoPacienteId)
    ) {
      setNuevoCasoPacienteId(pacientesDisponibles[0].id);
    }
  }, [pacientesDisponibles, nuevoCasoPacienteId]);

  useEffect(() => {
    if (
      especialistasRegistrados.length &&
      !especialistasRegistrados.some(
        (item) => item.id === nuevoCasoEspecialistaId,
      )
    ) {
      setNuevoCasoEspecialistaId(especialistasRegistrados[0].id);
    }
  }, [especialistasRegistrados, nuevoCasoEspecialistaId]);

  useEffect(() => {
    setPaginaActual(1);
  }, [rolUsuario]);

  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas);
    }
  }, [paginaActual, totalPaginas]);

  const renderEmptyState = (message: string) => (
    <div className='rounded-[28px] border border-sky-100 bg-white/85 p-6 shadow-[0_24px_60px_-40px_rgba(14,165,233,0.45)] backdrop-blur'>
      <div className='inline-flex items-center gap-3 text-sm font-medium text-slate-700'>
        <ClipboardList className='h-4 w-4 text-sky-700' />
        {message}
      </div>
    </div>
  );

  const renderImageUploadField = (containerClassName = 'md:col-span-2') => (
    <label
      className={`rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 ${containerClassName}`}
    >
      <span className='block text-xs font-medium uppercase tracking-[0.24em] text-slate-500'>
        Archivo de imagen
      </span>
      <input
        type='file'
        accept='image/*'
        onChange={handleNuevaImagenChange}
        className='mt-2 w-full text-sm text-slate-900 file:mr-3 file:rounded-2xl file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800'
        disabled={isUsuariosLoading || crearCasoMutation.isPending}
      />

      <div className='mt-3 flex flex-col gap-4 rounded-2xl border border-dashed border-slate-200 bg-white/90 p-4 sm:flex-row sm:items-center'>
        <div className='flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[22px] border border-slate-200 bg-slate-100 sm:h-32 sm:w-32'>
          {nuevaImagenBase64 ? (
            <img
              src={nuevaImagenBase64}
              alt={nuevaImagenNombre || 'Vista previa de la imagen seleccionada'}
              className='h-full w-full object-cover'
            />
          ) : (
            <ImageIcon className='h-8 w-8 text-slate-300' />
          )}
        </div>

        <div className='min-w-0 flex-1'>
          <p className='text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500'>
            Vista previa
          </p>
          <p className='mt-1 break-words text-sm font-medium text-slate-950'>
            {nuevaImagenNombre || 'Todavia no has seleccionado una imagen'}
          </p>
          <p className='mt-1 text-xs leading-5 text-slate-500'>
            {nuevaImagenBase64
              ? 'La imagen se enviara al endpoint en base64.'
              : 'Selecciona una imagen valida. No se admiten otros tipos de archivo.'}
          </p>
        </div>
      </div>

      {imagenArchivoFeedback ? (
        <p className='mt-2 text-xs font-medium text-rose-600'>
          {imagenArchivoFeedback}
        </p>
      ) : null}
    </label>
  );

  const handleNuevaImagenChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    setImagenArchivoFeedback(null);

    if (!file) {
      setNuevaImagenBase64('');
      setNuevaImagenNombre('');
      return;
    }

    const validationMessage = validateImageFile(file);

    if (validationMessage) {
      setNuevaImagenBase64('');
      setNuevaImagenNombre('');
      setImagenArchivoFeedback(validationMessage);
      event.target.value = '';
      return;
    }

    try {
      const imageBase64 = await fileToImageBase64(file);
      setNuevaImagenBase64(imageBase64);
      setNuevaImagenNombre(file.name);
    } catch (fileError) {
      setNuevaImagenBase64('');
      setNuevaImagenNombre('');
      setImagenArchivoFeedback(
        getErrorMessage(fileError, 'No se pudo procesar la imagen seleccionada.'),
      );
      event.target.value = '';
    }
  };

  const handleCrearCaso = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCrearCasoFeedback(null);

    const especialistaSeleccionadoId =
      rolUsuario === 'ESPECIALISTA' ? usuario?.id ?? '' : nuevoCasoEspecialistaId;

    if (
      !nuevoCasoPacienteId ||
      !especialistaSeleccionadoId ||
      !nuevaImagenBase64.trim()
    ) {
      setCrearCasoFeedback(
        'Selecciona paciente, especialista e imagen valida para crear el caso.',
      );
      return;
    }

    try {
      const nuevoCaso = await crearCasoMutation.mutateAsync({
        pacienteId: nuevoCasoPacienteId,
        especialistaId: especialistaSeleccionadoId,
        imagenBase64: nuevaImagenBase64.trim(),
      });

      setCrearCasoFeedback(`Caso #${nuevoCaso.id} creado correctamente.`);
      navigate(`/casos/${nuevoCaso.id}`);
    } catch (mutationError) {
      setCrearCasoFeedback(
        getErrorMessage(mutationError, 'No se pudo crear el caso.'),
      );
    }
  };

  const handlePageChange = (page: number) => {
    setPaginaActual(Math.min(Math.max(page, 1), totalPaginas));
  };

  const handleEstadoFiltroChange = (value: string) => {
    setEstadoFiltro(value);
    setPaginaActual(1);
  };

  const handleEspecialistaFiltroChange = (value: string) => {
    setEspecialistaFiltro(value);
    setPaginaActual(1);
  };

  if (!isAuthenticated || !usuario) {
    return <Navigate to='/login' replace />;
  }

  if (isLoading) {
    return (
      <div className='rounded-[28px] border border-sky-100 bg-white/85 p-6 shadow-[0_24px_60px_-40px_rgba(14,165,233,0.65)] backdrop-blur'>
        <div className='inline-flex items-center gap-3 text-sm font-medium text-sky-700'>
          <LoaderCircle className='h-4 w-4 animate-spin' />
          Cargando casos...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='rounded-[28px] border border-red-200 bg-white/85 p-6 text-red-700 shadow-[0_24px_60px_-40px_rgba(239,68,68,0.45)] backdrop-blur'>
        No se pudieron cargar los casos.
      </div>
    );
  }

  if (usuario.rol === 'PACIENTE') {
    return (
      <div className='space-y-5'>
        <div>
          <p className='text-xs font-medium uppercase tracking-[0.28em] text-sky-700'>
            Mis casos
          </p>
          <h1 className='mt-2 text-2xl font-semibold tracking-tight text-slate-950'>
            Mi historial
          </h1>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            Consulta el estado y la fecha de creacion de tus casos.
          </p>
        </div>

        {casosVisibles.length ? (
          <div className='space-y-4'>
            <div className='space-y-3'>
              {casosPaginados.map((caso) => (
                <Link
                  key={caso.id}
                  to={`/casos/${caso.id}`}
                  className='flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/90 px-5 py-4 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.35)] transition hover:border-sky-300 hover:bg-sky-50'
                >
                  <div>
                    <p className='text-sm font-semibold text-slate-950'>
                      Caso #{caso.id}
                    </p>
                    <p className='mt-1 text-sm text-slate-500'>
                      {caso.creado.toLocaleDateString('es-ES')}
                    </p>
                  </div>

                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${caso.estadoColor}`}
                  >
                    {caso.estadoLabel}
                  </span>
                </Link>
              ))}
            </div>

            {mostrarPaginacion ? (
              <PaginationControls
                currentPage={paginaActual}
                pageSize={casosPorPagina}
                totalItems={casosVisibles.length}
                totalPages={totalPaginas}
                onPageChange={handlePageChange}
              />
            ) : null}
          </div>
        ) : (
          renderEmptyState('No tienes casos registrados.')
        )}
      </div>
    );
  }

  if (usuario.rol === 'ESPECIALISTA') {
    return (
      <div className='space-y-5'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
          <div>
            <p className='text-xs font-medium uppercase tracking-[0.28em] text-sky-700'>
              Casos asignados
            </p>
            <h1 className='mt-2 text-2xl font-semibold tracking-tight text-slate-950'>
              Lista de trabajo
            </h1>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              Revisa los casos asignados y filtra por estado cuando necesites
              consultar revisiones anteriores.
            </p>
          </div>

          <CustomSelect
            label='Estado'
            value={estadoFiltro}
            onChange={handleEstadoFiltroChange}
            options={estadoFilterOptions}
            containerClassName='rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.35)] lg:min-w-56'
          />
        </div>

        <article className='rounded-[28px] border border-sky-100 bg-white/90 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.28)]'>
          <div className='space-y-2'>
            <p className='text-xs font-medium uppercase tracking-[0.28em] text-sky-700'>
              Nuevo caso
            </p>
            <h2 className='text-xl font-semibold tracking-tight text-slate-950'>
              Crear caso desde imagen
            </h2>
            <p className='text-sm leading-6 text-slate-600'>
              La subida de imagen crea el caso y dispara la prediccion en
              segundo plano. Podras consultar el avance bajo demanda en el
              detalle del caso.
            </p>
          </div>

          <form className='mt-5 grid gap-3 md:grid-cols-2' onSubmit={handleCrearCaso}>
            <CustomSelect
              label='Paciente'
              value={nuevoCasoPacienteId}
              onChange={setNuevoCasoPacienteId}
              options={pacientesOptions}
              disabled={isUsuariosLoading || crearCasoMutation.isPending}
              containerClassName='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'
            />

            {renderImageUploadField()}

            <div className='md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div className='text-sm text-slate-600'>
                {usuariosError
                  ? getErrorMessage(
                      usuariosError,
                      'No se pudieron cargar los usuarios del formulario.',
                    )
                  : crearCasoFeedback}
              </div>

              <button
                type='submit'
                disabled={
                  isUsuariosLoading ||
                  crearCasoMutation.isPending ||
                  !pacientesDisponibles.length
                }
                className='inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300'
              >
                {crearCasoMutation.isPending ? (
                  <>
                    <LoaderCircle className='h-4 w-4 animate-spin' />
                    Creando...
                  </>
                ) : (
                  <>
                    Crear caso
                    <ArrowRight className='h-4 w-4' />
                  </>
                )}
              </button>
            </div>
          </form>
        </article>

        {casosVisibles.length ? (
          <div className='space-y-4'>
            <div className='grid gap-4 xl:grid-cols-2'>
              {casosPaginados.map((caso) => (
                <Link
                  key={caso.id}
                  to={`/casos/${caso.id}`}
                  className='rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.28)] transition hover:border-sky-300 hover:bg-sky-50'
                >
                  <div className='flex items-start justify-between gap-4'>
                    <div>
                      <p className='text-xs font-medium uppercase tracking-[0.28em] text-sky-700'>
                        Caso #{caso.id}
                      </p>
                      <h2 className='mt-3 text-xl font-semibold tracking-tight text-slate-950'>
                        {caso.pacienteNombre}
                      </h2>
                    </div>

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${caso.estadoColor}`}
                    >
                      {caso.estadoLabel}
                    </span>
                  </div>

                  <div className='mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500'>
                    <span className='inline-flex items-center gap-2'>
                      <CalendarDays className='h-4 w-4 text-sky-700' />
                      {caso.creado.toLocaleDateString('es-ES')}
                    </span>

                    <span className='inline-flex items-center gap-2 font-medium text-sky-700'>
                      Ver caso
                      <ArrowRight className='h-4 w-4' />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {mostrarPaginacion ? (
              <PaginationControls
                currentPage={paginaActual}
                pageSize={casosPorPagina}
                totalItems={casosVisibles.length}
                totalPages={totalPaginas}
                onPageChange={handlePageChange}
              />
            ) : null}
          </div>
        ) : estadoFiltro === 'todos' ? (
          renderEmptyState('No hay casos asignados.')
        ) : (
          renderEmptyState(
            'No hay casos asignados para el estado seleccionado.',
          )
        )}
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <p className='text-xs font-medium uppercase tracking-[0.28em] text-sky-700'>
            Administracion
          </p>
          <h1 className='mt-2 text-2xl font-semibold tracking-tight text-slate-950'>
            Todos los casos
          </h1>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            Consulta todos los casos y filtra por estado o especialista.
          </p>
        </div>

        <div className='grid gap-3 sm:grid-cols-2'>
          <CustomSelect
            label='Estado'
            value={estadoFiltro}
            onChange={handleEstadoFiltroChange}
            options={estadoFilterOptions}
            containerClassName='rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.35)]'
          />

          <CustomSelect
            label='Especialista'
            value={especialistaFiltro}
            onChange={handleEspecialistaFiltroChange}
            options={especialistaFilterOptions}
            containerClassName='rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.35)]'
          />
        </div>
      </div>

      <section className='grid gap-4 xl:grid-cols-[1.25fr_0.75fr]'>
        <article className='rounded-[28px] border border-sky-100 bg-white/90 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.28)]'>
          <div className='space-y-2'>
            <p className='text-xs font-medium uppercase tracking-[0.28em] text-sky-700'>
              Nuevo caso
            </p>
            <h2 className='text-xl font-semibold tracking-tight text-slate-950'>
              Crear caso desde imagen
            </h2>
            <p className='text-sm leading-6 text-slate-600'>
              Registra la imagen inicial y asigna especialista. El modelo
              empezara a procesar en segundo plano y la prediccion se podra
              consultar bajo demanda desde el detalle.
            </p>
          </div>

          <form className='mt-5 grid gap-3 md:grid-cols-2' onSubmit={handleCrearCaso}>
            <CustomSelect
              label='Paciente'
              value={nuevoCasoPacienteId}
              onChange={setNuevoCasoPacienteId}
              options={pacientesOptions}
              disabled={isUsuariosLoading || crearCasoMutation.isPending}
              containerClassName='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'
            />

            <CustomSelect
              label='Especialista'
              value={nuevoCasoEspecialistaId}
              onChange={setNuevoCasoEspecialistaId}
              options={especialistasOptions}
              disabled={isUsuariosLoading || crearCasoMutation.isPending}
              containerClassName='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'
            />

            {renderImageUploadField()}

            <div className='md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div className='text-sm text-slate-600'>
                {usuariosError
                  ? getErrorMessage(
                      usuariosError,
                      'No se pudieron cargar los usuarios del formulario.',
                    )
                  : crearCasoFeedback}
              </div>

              <button
                type='submit'
                disabled={
                  isUsuariosLoading ||
                  crearCasoMutation.isPending ||
                  !pacientesDisponibles.length ||
                  !especialistasRegistrados.length
                }
                className='inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300'
              >
                {crearCasoMutation.isPending ? (
                  <>
                    <LoaderCircle className='h-4 w-4 animate-spin' />
                    Creando...
                  </>
                ) : (
                  <>
                    Crear caso
                    <ArrowRight className='h-4 w-4' />
                  </>
                )}
              </button>
            </div>
          </form>
        </article>

        <article className='rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.28)]'>
          <p className='text-xs font-medium uppercase tracking-[0.28em] text-slate-500'>
            Resumen rapido
          </p>
          <div className='mt-4 space-y-3 text-sm text-slate-600'>
            <p>
              Pacientes registrados: <span className='font-medium text-slate-950'>{pacientesDisponibles.length}</span>
            </p>
            <p>
              Especialistas activos: <span className='font-medium text-slate-950'>{especialistasRegistrados.length}</span>
            </p>
            <p>
              Casos visibles: <span className='font-medium text-slate-950'>{casosVisibles.length}</span>
            </p>
          </div>
        </article>
      </section>

      <section className='grid gap-4 md:grid-cols-3'>
        {resumenAdmin.map((card) => (
          <article
            key={card.label}
            className='rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.28)]'
          >
            <div className='flex items-center justify-between gap-3'>
              <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700'>
                <card.icon className='h-5 w-5' />
              </div>
              <span className='text-3xl font-semibold tracking-tight text-slate-950'>
                {card.value}
              </span>
            </div>
            <p className='mt-4 text-sm font-medium text-slate-900'>
              {card.label}
            </p>
          </article>
        ))}
      </section>

      {casosVisibles.length ? (
        <div className='space-y-4'>
          <section className='overflow-hidden rounded-[28px] border border-slate-200 bg-white/90 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.28)]'>
            <div className='hidden grid-cols-[1.1fr_1.1fr_0.9fr_0.9fr_32px] gap-4 border-b border-slate-100 px-5 py-4 text-xs font-medium uppercase tracking-[0.24em] text-slate-500 md:grid'>
              <span className='inline-flex items-center gap-2'>
                <UserRound className='h-3.5 w-3.5' />
                Paciente
              </span>
              <span className='inline-flex items-center gap-2'>
                <Stethoscope className='h-3.5 w-3.5' />
                Especialista
              </span>
              <span>Estado</span>
              <span>Fecha</span>
              <span />
            </div>

            <div className='divide-y divide-slate-100'>
              {casosPaginados.map((caso) => (
                <Link
                  key={caso.id}
                  to={`/casos/${caso.id}`}
                  className='grid gap-3 px-5 py-4 transition hover:bg-sky-50 md:grid-cols-[1.1fr_1.1fr_0.9fr_0.9fr_32px] md:items-center'
                >
                  <div>
                    <p className='text-xs font-medium uppercase tracking-[0.24em] text-slate-500 md:hidden'>
                      Paciente
                    </p>
                    <p className='text-sm font-medium text-slate-950'>
                      {caso.pacienteNombre}
                    </p>
                  </div>

                  <div>
                    <p className='text-xs font-medium uppercase tracking-[0.24em] text-slate-500 md:hidden'>
                      Especialista
                    </p>
                    <p className='text-sm font-medium text-slate-950'>
                      {caso.especialistaNombre}
                    </p>
                  </div>

                  <div>
                    <p className='text-xs font-medium uppercase tracking-[0.24em] text-slate-500 md:hidden'>
                      Estado
                    </p>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${caso.estadoColor}`}
                    >
                      {caso.estadoLabel}
                    </span>
                  </div>

                  <div>
                    <p className='text-xs font-medium uppercase tracking-[0.24em] text-slate-500 md:hidden'>
                      Fecha
                    </p>
                    <p className='text-sm text-slate-600'>
                      {caso.creado.toLocaleDateString('es-ES')}
                    </p>
                  </div>

                  <div className='hidden justify-end md:flex'>
                    <ArrowRight className='h-4 w-4 text-sky-700' />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {mostrarPaginacion ? (
            <PaginationControls
              currentPage={paginaActual}
              pageSize={casosPorPagina}
              totalItems={casosVisibles.length}
              totalPages={totalPaginas}
              onPageChange={handlePageChange}
            />
          ) : null}
        </div>
      ) : (
        renderEmptyState('No hay casos que coincidan con los filtros seleccionados.')
      )}
    </div>
  );
};

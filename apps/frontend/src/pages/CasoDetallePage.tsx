import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { LoaderCircle, Lock } from 'lucide-react';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { estadoCasoMap } from '@/features/casos/constants/estado-caso';
import { CasoDetalleAnalisisView } from '@/features/casos/components/detalle/CasoDetalleAnalisisView';
import { CasoDetalleGestionView } from '@/features/casos/components/detalle/CasoDetalleGestionView';
import { CasoDetalleHeader } from '@/features/casos/components/detalle/CasoDetalleHeader';
import { CasoDetalleResumenView } from '@/features/casos/components/detalle/CasoDetalleResumenView';
import { useActualizarEstadoCaso } from '@/features/casos/hooks/useActualizarEstadoCaso';
import { useCasoDetalle } from '@/features/casos/hooks/useCasoDetalle';
import { useCrearDiagnostico } from '@/features/casos/hooks/useCrearDiagnostico';
import { useCrearValidacion } from '@/features/casos/hooks/useCrearValidacion';
import { fileToImageBase64, validateImageFile } from '@/shared/lib/image-file';
import type { EstadoCaso, ResultadoClinico } from '@/shared/types';

type DetalleSection = 'resumen' | 'analisis' | 'gestion';

const isDetalleSection = (value: string | undefined): value is DetalleSection =>
  value === 'resumen' || value === 'analisis' || value === 'gestion';

const getDateTs = (date: Date | null | undefined) => date?.getTime() ?? 0;

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const inferResultadoClinico = (conclusion: string): ResultadoClinico => {
  const text = conclusion.toLowerCase();

  if (text.includes('benign')) return 'benigno';
  if (text.includes('inflama') || text.includes('dermatitis')) return 'inflamatorio';
  if (
    text.includes('sospech') ||
    text.includes('malign') ||
    text.includes('melanoma') ||
    text.includes('carcinoma')
  ) {
    return 'sospechoso';
  }

  return 'requiere_revision';
};

export const CasoDetallePage = () => {
  const { id, section } = useParams();
  const { usuario, isAuthenticated } = useAuthStore();
  const { data, error, isLoading, isFetching, refetch } = useCasoDetalle(id ?? '');

  const actualizarEstadoMutation = useActualizarEstadoCaso();
  const crearDiagnosticoMutation = useCrearDiagnostico();
  const crearValidacionMutation = useCrearValidacion();

  const activeSection: DetalleSection = isDetalleSection(section)
    ? section
    : 'resumen';

  const [estadoDraft, setEstadoDraft] = useState<EstadoCaso | null>(null);
  const [gestionFeedback, setGestionFeedback] = useState<string | null>(null);

  const [diagnosticoNota, setDiagnosticoNota] = useState('');
  const [diagnosticoImagenBase64, setDiagnosticoImagenBase64] = useState('');
  const [diagnosticoImagenNombre, setDiagnosticoImagenNombre] = useState('');
  const [diagnosticoImagenFeedback, setDiagnosticoImagenFeedback] = useState<
    string | null
  >(null);

  const [validacionDiagnosticoId, setValidacionDiagnosticoId] = useState('');
  const [validacionPrediccionId, setValidacionPrediccionId] = useState('');
  const [validacionConclusion, setValidacionConclusion] = useState('');
  const [analisisFeedback, setAnalisisFeedback] = useState<string | null>(null);

  const permisos = useMemo(() => {
    if (!usuario || !data) return null;

    const esAdmin = usuario.rol === 'ADMIN';
    const esEspecialistaResponsable =
      usuario.rol === 'ESPECIALISTA' && usuario.id === data.especialista.id;
    const esPacienteDelCaso =
      usuario.rol === 'PACIENTE' && usuario.id === data.paciente.id;

    return {
      verAnalisisIA: esAdmin || esEspecialistaResponsable,
      gestionarCaso: esAdmin || esEspecialistaResponsable,
      verResumen: esAdmin || esEspecialistaResponsable || esPacienteDelCaso,
    };
  }, [usuario, data]);

  const logic = useMemo(() => {
    if (!data) return null;

    const diagnosticos = [...data.diagnosticos].sort(
      (a, b) => getDateTs(b.creado) - getDateTs(a.creado),
    );

    const predicciones = diagnosticos
      .flatMap((diagnostico) => diagnostico.predicciones)
      .sort((a, b) => getDateTs(b.creado) - getDateTs(a.creado));

    return {
      diagnosticos,
      predicciones,
      ultimoDiagnostico: diagnosticos[0] ?? null,
      ultimaPrediccion: predicciones[0] ?? null,
    };
  }, [data]);

  const estadoOptions = useMemo(
    () =>
      (Object.keys(estadoCasoMap) as EstadoCaso[]).map((estado) => ({
        value: estado,
        label: estadoCasoMap[estado].label,
      })),
    [],
  );

  const diagnosticoOptions = useMemo(
    () =>
      (logic?.diagnosticos ?? [])
        .filter((diagnostico) =>
          diagnostico.predicciones.some((prediccion) => prediccion.estado === 'lista'),
        )
        .map((diagnostico, index, arr) => ({
          value: diagnostico.id,
          label: `Diagnóstico #${arr.length - index} (${diagnostico.creado?.toLocaleDateString() ?? 'sin fecha'})`,
        })),
    [logic],
  );

  const estadoSeleccionado: EstadoCaso = estadoDraft ?? data?.estado ?? 'pendiente';

  const validacionDiagnosticoSeleccionadoId =
    diagnosticoOptions.some((item) => item.value === validacionDiagnosticoId)
      ? validacionDiagnosticoId
      : diagnosticoOptions[0]?.value ?? '';

  const prediccionOptions = useMemo(
    () =>
      (
        logic?.diagnosticos
          .find((diagnostico) => diagnostico.id === validacionDiagnosticoSeleccionadoId)
          ?.predicciones.filter((prediccion) => prediccion.estado === 'lista') ?? []
      ).map((prediccion) => ({
        value: prediccion.id,
        label: `Predicción ${prediccion.id.slice(0, 8)} (${prediccion.creado?.toLocaleDateString() ?? 'sin fecha'})`,
      })),
    [logic, validacionDiagnosticoSeleccionadoId],
  );

  const validacionPrediccionSeleccionadaId =
    prediccionOptions.some((item) => item.value === validacionPrediccionId)
      ? validacionPrediccionId
      : prediccionOptions[0]?.value ?? '';

  if (!isAuthenticated || !usuario) return <Navigate to='/login' replace />;
  if (isLoading) return <LoadingState />;
  if (error || !data || !permisos)
    return (
      <ErrorState message='No tienes permiso para ver este caso o no existe.' />
    );

  const fallbackSection: DetalleSection =
    activeSection === 'analisis' && !permisos.verAnalisisIA
      ? 'resumen'
      : activeSection === 'gestion' && !permisos.gestionarCaso
        ? 'resumen'
        : activeSection;

  const shouldRedirect =
    !isDetalleSection(section) || fallbackSection !== activeSection;

  if (shouldRedirect) {
    return <Navigate to={`/casos/${data.id}/${fallbackSection}`} replace />;
  }

  const handleActualizarEstado = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGestionFeedback(null);

    if (!permisos.gestionarCaso) {
      setGestionFeedback('No tienes permisos para actualizar el estado.');
      return;
    }

    try {
      await actualizarEstadoMutation.mutateAsync({
        casoId: data.id,
        input: { estado: estadoSeleccionado },
      });

      setGestionFeedback('Estado del caso actualizado correctamente.');
    } catch (mutationError) {
      setGestionFeedback(
        getErrorMessage(mutationError, 'No se pudo actualizar el estado.'),
      );
    }
  };

  const handleDiagnosticoImagenChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    setDiagnosticoImagenFeedback(null);

    if (!file) {
      setDiagnosticoImagenBase64('');
      setDiagnosticoImagenNombre('');
      return;
    }

    const validationMessage = validateImageFile(file);

    if (validationMessage) {
      setDiagnosticoImagenBase64('');
      setDiagnosticoImagenNombre('');
      setDiagnosticoImagenFeedback(validationMessage);
      event.target.value = '';
      return;
    }

    try {
      const imageBase64 = await fileToImageBase64(file);
      setDiagnosticoImagenBase64(imageBase64);
      setDiagnosticoImagenNombre(file.name);
    } catch (fileError) {
      setDiagnosticoImagenBase64('');
      setDiagnosticoImagenNombre('');
      setDiagnosticoImagenFeedback(
        getErrorMessage(
          fileError,
          'No se pudo procesar la imagen seleccionada.',
        ),
      );
      event.target.value = '';
    }
  };

  const handleCrearDiagnostico = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGestionFeedback(null);

    if (!permisos.gestionarCaso) {
      setGestionFeedback('No tienes permisos para registrar diagnósticos.');
      return;
    }

    if (!diagnosticoImagenBase64.trim() || !diagnosticoNota.trim()) {
      setGestionFeedback(
        'Debes adjuntar una imagen válida y una nota clínica.',
      );
      return;
    }

    try {
      await crearDiagnosticoMutation.mutateAsync({
        casoId: data.id,
        input: {
          imagenBase64: diagnosticoImagenBase64.trim(),
          nota: diagnosticoNota.trim(),
        },
      });

      setGestionFeedback(
        'Diagnóstico registrado. La IA puede tardar en responder.',
      );
      setDiagnosticoNota('');
      setDiagnosticoImagenBase64('');
      setDiagnosticoImagenNombre('');
      setDiagnosticoImagenFeedback(null);
    } catch (mutationError) {
      setGestionFeedback(
        getErrorMessage(mutationError, 'No se pudo registrar el diagnóstico.'),
      );
    }
  };

  const handleCrearValidacion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAnalisisFeedback(null);

    if (!permisos.gestionarCaso) {
      setAnalisisFeedback('No tienes permisos para registrar validaciones.');
      return;
    }

    if (!validacionPrediccionSeleccionadaId) {
      setAnalisisFeedback(
        'Selecciona una predicción para registrar la validación.',
      );
      return;
    }

    if (!validacionConclusion.trim()) {
      setAnalisisFeedback(
        'La conclusión clínica es obligatoria para registrar la validación.',
      );
      return;
    }

    try {
      await crearValidacionMutation.mutateAsync({
        casoId: data.id,
        input: {
          prediccionId: validacionPrediccionSeleccionadaId,
          resultadoFinal: inferResultadoClinico(validacionConclusion),
          nota: validacionConclusion.trim(),
        },
      });

      if (data.estado !== 'completado') {
        await actualizarEstadoMutation.mutateAsync({
          casoId: data.id,
          input: { estado: 'completado' },
        });
        setEstadoDraft('completado');
      }

      setAnalisisFeedback(
        'Validación clínica registrada. El caso ha pasado a completado.',
      );
      setValidacionConclusion('');
    } catch (mutationError) {
      setAnalisisFeedback(
        getErrorMessage(mutationError, 'No se pudo registrar la validación.'),
      );
    }
  };

  const handleConsultarPrediccion = async () => {
    setAnalisisFeedback(null);
    try {
      await refetch();
      setAnalisisFeedback(
        'Información actualizada bajo demanda. Si la IA sigue procesando, vuelve a consultar en unos segundos.',
      );
    } catch (queryError) {
      setAnalisisFeedback(
        getErrorMessage(queryError, 'No se pudo consultar la predicción ahora mismo.'),
      );
    }
  };

  const handleDiagnosticoValidacionChange = (value: string) => {
    setValidacionDiagnosticoId(value);
    setValidacionPrediccionId('');
  };

  return (
    <div className='mx-auto w-full max-w-7xl space-y-6 px-4 pb-20'>
      <CasoDetalleHeader
        casoId={data.id}
        estadoLabel={data.estadoLabel}
        estadoColor={data.estadoColor}
        pacienteNombre={data.paciente.nombreCompleto}
        esPaciente={usuario.rol === 'PACIENTE'}
        activeSection={activeSection}
        canViewAI={permisos.verAnalisisIA}
        canManage={permisos.gestionarCaso}
      />

      <main className='animate-in fade-in slide-in-from-bottom-4 duration-500'>
        {activeSection === 'resumen' && logic ? (
          <CasoDetalleResumenView
            data={data}
            diagnosticos={logic.diagnosticos}
            ultimoDiagnostico={logic.ultimoDiagnostico}
          />
        ) : null}

        {activeSection === 'analisis' && permisos.verAnalisisIA && logic ? (
          <CasoDetalleAnalisisView
            diagnosticos={logic.diagnosticos}
            ultimaPrediccion={logic.ultimaPrediccion}
            predicciones={logic.predicciones}
            diagnosticoOptions={diagnosticoOptions}
            prediccionOptions={prediccionOptions}
            validacionDiagnosticoId={validacionDiagnosticoSeleccionadoId}
            validacionPrediccionId={validacionPrediccionSeleccionadaId}
            validacionConclusion={validacionConclusion}
            analisisFeedback={analisisFeedback}
            isFetching={isFetching}
            isSubmitting={
              crearValidacionMutation.isPending || actualizarEstadoMutation.isPending
            }
            onRefresh={handleConsultarPrediccion}
            onSubmitValidacion={handleCrearValidacion}
            onDiagnosticoChange={handleDiagnosticoValidacionChange}
            onPrediccionChange={setValidacionPrediccionId}
            onConclusionChange={setValidacionConclusion}
          />
        ) : null}

        {activeSection === 'gestion' && permisos.gestionarCaso && logic ? (
          <CasoDetalleGestionView
            diagnosticos={logic.diagnosticos}
            estadoSeleccionado={estadoSeleccionado}
            estadoOptions={estadoOptions}
            diagnosticoNota={diagnosticoNota}
            diagnosticoImagenBase64={diagnosticoImagenBase64}
            diagnosticoImagenNombre={diagnosticoImagenNombre}
            diagnosticoImagenFeedback={diagnosticoImagenFeedback}
            gestionFeedback={gestionFeedback}
            isSavingEstado={actualizarEstadoMutation.isPending}
            isSavingDiagnostico={crearDiagnosticoMutation.isPending}
            onSubmitEstado={handleActualizarEstado}
            onEstadoChange={setEstadoDraft}
            onSubmitDiagnostico={handleCrearDiagnostico}
            onDiagnosticoNotaChange={setDiagnosticoNota}
            onDiagnosticoImagenChange={handleDiagnosticoImagenChange}
          />
        ) : null}
      </main>
    </div>
  );
};

const LoadingState = () => (
  <div className='flex min-h-[400px] flex-col items-center justify-center space-y-4'>
    <LoaderCircle className='h-10 w-10 animate-spin text-sky-500' />
    <p className='font-bold tracking-tighter text-slate-500'>
      Sincronizando datos médicos...
    </p>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className='mx-auto mt-20 max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-2xl shadow-red-500/10'>
    <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500'>
      <Lock className='h-8 w-8' />
    </div>
    <p className='text-lg font-bold text-slate-900'>{message}</p>
    <Link
      to='/casos'
      className='mt-4 inline-block text-sm font-bold text-sky-600 hover:underline'
    >
      Regresar al panel
    </Link>
  </div>
);

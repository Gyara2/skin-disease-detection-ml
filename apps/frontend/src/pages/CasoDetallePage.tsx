import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ClipboardCheck,
  ImageIcon,
  LoaderCircle,
  Lock,
  Upload,
} from 'lucide-react';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { useAgregarImagenCaso } from '@/features/casos/hooks/useAgregarImagenCaso';
import { useCasoDetalle } from '@/features/casos/hooks/useCasoDetalle';
import { useGuardarDiagnosticoEspecialista } from '@/features/casos/hooks/useGuardarDiagnosticoEspecialista';
import { fileToImageBase64, validateImageFile } from '@/shared/lib/image-file';

type DetalleSection = 'resumen' | 'gestion';

const isDetalleSection = (value: string | undefined): value is DetalleSection =>
  value === 'resumen' || value === 'gestion';

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const CasoDetallePage = () => {
  const { id, section } = useParams();
  const { usuario, isAuthenticated } = useAuthStore();
  const { data, error, isLoading } = useCasoDetalle(id ?? '');
  const agregarImagenMutation = useAgregarImagenCaso();
  const guardarDiagnosticoMutation = useGuardarDiagnosticoEspecialista();

  const [imagenBase64, setImagenBase64] = useState('');
  const [imagenNombre, setImagenNombre] = useState('');
  const [imagenFeedback, setImagenFeedback] = useState<string | null>(null);
  const [gestionFeedback, setGestionFeedback] = useState<string | null>(null);
  const [diagnosticoFinal, setDiagnosticoFinal] = useState('');
  const [notaDiagnostico, setNotaDiagnostico] = useState('');
  const [diagnosticoFeedback, setDiagnosticoFeedback] = useState<string | null>(null);

  const activeSection: DetalleSection = isDetalleSection(section)
    ? section
    : 'resumen';

  const permisos = useMemo(() => {
    if (!usuario || !data) return null;

    const esAdmin = usuario.rol === 'ADMIN';
    const esEspecialistaResponsable =
      usuario.rol === 'ESPECIALISTA' && usuario.id === data.especialista.id;
    const esPacienteDelCaso =
      usuario.rol === 'PACIENTE' && usuario.id === data.paciente.id;

    return {
      verCaso: esAdmin || esEspecialistaResponsable || esPacienteDelCaso,
      gestionarImagenes: esAdmin || esEspecialistaResponsable,
      gestionarDiagnostico: esEspecialistaResponsable,
    };
  }, [usuario, data]);

  const imagenes = useMemo(() => {
    if (!data) return [];

    if (data.imagenes.length) {
      return data.imagenes;
    }

    return data.diagnosticos
      .map((diagnostico) => diagnostico.imagen)
      .filter((imagen) => imagen !== null);
  }, [data]);

  useEffect(() => {
    if (!data?.diagnosticoEspecialista) {
      return;
    }

    setDiagnosticoFinal(data.diagnosticoEspecialista.diagnostico);
    setNotaDiagnostico(data.diagnosticoEspecialista.nota ?? '');
  }, [data?.diagnosticoEspecialista]);

  if (!isAuthenticated || !usuario) return <Navigate to='/login' replace />;
  if (isLoading) return <LoadingState />;
  if (error || !data || !permisos?.verCaso)
    return (
      <ErrorState message='No tienes permiso para ver este caso o no existe.' />
    );

  if (activeSection === 'gestion' && !permisos.gestionarImagenes) {
    return <Navigate to={`/casos/${data.id}/resumen`} replace />;
  }

  const handleImagenChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    setImagenFeedback(null);

    if (!file) {
      setImagenBase64('');
      setImagenNombre('');
      return;
    }

    const validationMessage = validateImageFile(file);

    if (validationMessage) {
      setImagenBase64('');
      setImagenNombre('');
      setImagenFeedback(validationMessage);
      event.target.value = '';
      return;
    }

    try {
      const image = await fileToImageBase64(file);
      setImagenBase64(image);
      setImagenNombre(file.name);
    } catch (fileError) {
      setImagenBase64('');
      setImagenNombre('');
      setImagenFeedback(
        getErrorMessage(fileError, 'No se pudo procesar la imagen seleccionada.'),
      );
      event.target.value = '';
    }
  };

  const handleAgregarImagen = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGestionFeedback(null);

    if (!permisos.gestionarImagenes) {
      setGestionFeedback('No tienes permisos para añadir imágenes a este caso.');
      return;
    }

    if (!imagenBase64.trim()) {
      setGestionFeedback('Selecciona una imagen válida antes de guardar.');
      return;
    }

    try {
      await agregarImagenMutation.mutateAsync({
        casoId: data.id,
        pacienteId: data.paciente.id,
        especialistaId: data.especialista.id,
        imagenBase64: imagenBase64.trim(),
      });

      setGestionFeedback('Imagen añadida correctamente al caso.');
      setImagenBase64('');
      setImagenNombre('');
      setImagenFeedback(null);
    } catch (mutationError) {
      setGestionFeedback(
        getErrorMessage(mutationError, 'No se pudo guardar la imagen.'),
      );
    }
  };

  const handleGuardarDiagnostico = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDiagnosticoFeedback(null);

    if (!permisos.gestionarDiagnostico || !usuario) {
      setDiagnosticoFeedback('No tienes permiso para guardar el diagnóstico final.');
      return;
    }

    if (!diagnosticoFinal.trim()) {
      setDiagnosticoFeedback('Indica el diagnóstico final antes de guardar.');
      return;
    }

    try {
      await guardarDiagnosticoMutation.mutateAsync({
        casoId: data.id,
        input: {
          especialistaId: usuario.id,
          diagnostico: diagnosticoFinal.trim(),
          nota: notaDiagnostico.trim() || undefined,
        },
      });
      setDiagnosticoFeedback('Diagnóstico del especialista guardado correctamente.');
    } catch (mutationError) {
      setDiagnosticoFeedback(
        getErrorMessage(
          mutationError,
          'No se pudo guardar el diagnóstico del especialista.',
        ),
      );
    }
  };

  return (
    <div className='mx-auto w-full max-w-7xl space-y-6 px-4 pb-20'>
      <header className='relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
        <div className='grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center'>
          <div>
            <Link
              to='/casos'
              className='inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-sky-600'
            >
              <ArrowLeft className='h-3 w-3' /> Volver
            </Link>
            <h1 className='mt-3 text-3xl font-black tracking-tight text-slate-900'>
              Caso #{data.id}
            </h1>
            <p className='mt-2 text-sm text-slate-600'>
              Paciente: {data.paciente.nombreCompleto}
            </p>
            <p className='text-sm text-slate-600'>
              Especialista: {data.especialista.nombreCompleto}
            </p>
          </div>
          <div
            className={`w-fit rounded-2xl px-4 py-2 text-sm font-bold shadow-sm md:justify-self-end ${data.estadoColor}`}
          >
            {data.estadoLabel}
          </div>
        </div>

        <nav className='mt-6 flex w-full flex-wrap gap-1.5 rounded-2xl bg-slate-100 p-1.5'>
          <Link
            to={`/casos/${data.id}/resumen`}
            className={`flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-bold transition ${
              activeSection === 'resumen'
                ? 'bg-white text-sky-700 shadow-sm ring-1 ring-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Resumen
          </Link>
          {permisos.gestionarImagenes ? (
            <Link
              to={`/casos/${data.id}/gestion`}
              className={`flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-bold transition ${
                activeSection === 'gestion'
                  ? 'bg-white text-sky-700 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Gestión de imágenes
            </Link>
          ) : null}
        </nav>
      </header>

      {activeSection === 'resumen' ? (
        <section className='space-y-5'>
          <article className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
            <h2 className='text-lg font-bold text-slate-900'>Información general</h2>
            <div className='mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2'>
              <p>
                Creado:{' '}
                <span className='font-medium text-slate-900'>
                  {data.creado.toLocaleString('es-ES')}
                </span>
              </p>
              <p>
                Última actualización:{' '}
                <span className='font-medium text-slate-900'>
                  {data.actualizado.toLocaleString('es-ES')}
                </span>
              </p>
              <p>
                Total imágenes:{' '}
                <span className='font-medium text-slate-900'>{imagenes.length}</span>
              </p>
            </div>
          </article>

          <article className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
            <h2 className='text-lg font-bold text-slate-900'>
              Diagnóstico del especialista
            </h2>

            {data.diagnosticoEspecialista ? (
              <div className='mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900'>
                <p className='font-semibold'>
                  Resultado final: {data.diagnosticoEspecialista.diagnostico}
                </p>
                {data.diagnosticoEspecialista.nota ? (
                  <p className='mt-2 text-emerald-800'>
                    Nota clínica: {data.diagnosticoEspecialista.nota}
                  </p>
                ) : null}
                <p className='mt-2 text-xs text-emerald-700'>
                  Emitido por{' '}
                  {data.diagnosticoEspecialista.especialistaNombre ??
                    data.especialista.nombreCompleto}
                  {' · '}
                  {(
                    data.diagnosticoEspecialista.actualizado ??
                    data.diagnosticoEspecialista.creado
                  )?.toLocaleString('es-ES') ?? 'sin fecha'}
                </p>
              </div>
            ) : (
              <p className='mt-4 text-sm text-slate-600'>
                El especialista todavía no ha emitido un diagnóstico final para este caso.
              </p>
            )}

            {permisos.gestionarDiagnostico ? (
              <form className='mt-5 space-y-3' onSubmit={handleGuardarDiagnostico}>
                <label className='block text-sm text-slate-700'>
                  <span className='text-xs font-medium uppercase tracking-[0.2em] text-slate-500'>
                    Diagnóstico final
                  </span>
                  <input
                    type='text'
                    value={diagnosticoFinal}
                    onChange={(event) => setDiagnosticoFinal(event.target.value)}
                    placeholder='Ej.: Queratosis seborreica'
                    disabled={guardarDiagnosticoMutation.isPending}
                    className='mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-sky-200 transition focus:ring'
                  />
                </label>

                <label className='block text-sm text-slate-700'>
                  <span className='text-xs font-medium uppercase tracking-[0.2em] text-slate-500'>
                    Nota clínica (opcional)
                  </span>
                  <textarea
                    value={notaDiagnostico}
                    onChange={(event) => setNotaDiagnostico(event.target.value)}
                    disabled={guardarDiagnosticoMutation.isPending}
                    rows={3}
                    className='mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-sky-200 transition focus:ring'
                    placeholder='Observaciones del especialista'
                  />
                </label>

                {diagnosticoFeedback ? (
                  <p className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'>
                    {diagnosticoFeedback}
                  </p>
                ) : null}

                <button
                  type='submit'
                  disabled={guardarDiagnosticoMutation.isPending}
                  className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300'
                >
                  {guardarDiagnosticoMutation.isPending ? (
                    <>
                      <LoaderCircle className='h-4 w-4 animate-spin' />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <ClipboardCheck className='h-4 w-4' />
                      Guardar diagnóstico final
                    </>
                  )}
                </button>
              </form>
            ) : null}
          </article>

          <article className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
            <h2 className='text-lg font-bold text-slate-900'>Imágenes del caso</h2>
            {imagenes.length ? (
              <div className='mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                {imagenes.map((imagen, index) => (
                  <div
                    key={imagen.id}
                    className='overflow-hidden rounded-2xl border border-slate-200 bg-slate-50'
                  >
                    <div className='flex h-48 items-center justify-center bg-slate-100'>
                      {imagen.src ? (
                        <img
                          src={imagen.src}
                          alt={imagen.nombreArchivo ?? `Imagen ${index + 1}`}
                          className='h-full w-full object-cover'
                        />
                      ) : (
                        <ImageIcon className='h-8 w-8 text-slate-300' />
                      )}
                    </div>
                    <div className='p-3 text-xs text-slate-600'>
                      <p className='font-medium text-slate-900'>
                        {imagen.nombreArchivo ?? `Imagen #${index + 1}`}
                      </p>
                      <p className='mt-1'>
                        Subida:{' '}
                        {imagen.uploadedAt
                          ? imagen.uploadedAt.toLocaleString('es-ES')
                          : 'Sin fecha'}
                      </p>
                      <div className='mt-3 rounded-xl border border-slate-200 bg-white p-2'>
                        <p className='text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700'>
                          Predicción IA
                        </p>
                        {imagen.prediccion &&
                        Object.keys(imagen.prediccion.resultado).length ? (
                          <div className='mt-2 space-y-1'>
                            {Object.entries(imagen.prediccion.resultado)
                              .sort((a, b) => b[1] - a[1])
                              .slice(0, 3)
                              .map(([etiqueta, valor]) => (
                                <div
                                  key={etiqueta}
                                  className='flex items-center justify-between gap-2'
                                >
                                  <span className='text-slate-700'>{etiqueta}</span>
                                  <span className='font-medium text-slate-900'>
                                    {(valor * 100).toFixed(2)}%
                                  </span>
                                </div>
                              ))}
                            <p className='pt-1 text-[10px] text-slate-500'>
                              Modelo: {imagen.prediccion.modeloVersion ?? 'N/D'}
                            </p>
                          </div>
                        ) : (
                          <p className='mt-2 text-[11px] text-slate-500'>
                            Predicción pendiente o no disponible.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='mt-4 text-sm text-slate-600'>
                Este caso aún no tiene imágenes disponibles.
              </p>
            )}
          </article>
        </section>
      ) : null}

      {activeSection === 'gestion' && permisos.gestionarImagenes ? (
        <section className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
          <h2 className='text-lg font-bold text-slate-900'>Añadir nueva imagen</h2>
          <p className='mt-2 text-sm text-slate-600'>
            La imagen se adjuntará al caso y se enviará al backend para su procesamiento.
          </p>

          <form className='mt-5 space-y-4' onSubmit={handleAgregarImagen}>
            <label className='block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'>
              <span className='block text-xs font-medium uppercase tracking-[0.24em] text-slate-500'>
                Imagen clínica
              </span>
              <input
                type='file'
                accept='image/*'
                onChange={handleImagenChange}
                className='mt-2 w-full text-sm text-slate-900 file:mr-3 file:rounded-2xl file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800'
                disabled={agregarImagenMutation.isPending}
              />
            </label>

            <div className='flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white p-3'>
              <div className='flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100'>
                {imagenBase64 ? (
                  <img
                    src={imagenBase64}
                    alt={imagenNombre || 'Previsualización de imagen'}
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <ImageIcon className='h-6 w-6 text-slate-300' />
                )}
              </div>
              <div className='text-xs text-slate-600'>
                <p className='font-medium text-slate-900'>
                  {imagenNombre || 'No has seleccionado una imagen todavía'}
                </p>
                <p className='mt-1'>El backend recibirá la imagen en base64 puro.</p>
              </div>
            </div>

            {imagenFeedback ? (
              <p className='text-xs font-medium text-rose-600'>{imagenFeedback}</p>
            ) : null}

            {gestionFeedback ? (
              <p className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'>
                {gestionFeedback}
              </p>
            ) : null}

            <button
              type='submit'
              disabled={agregarImagenMutation.isPending}
              className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300'
            >
              {agregarImagenMutation.isPending ? (
                <>
                  <LoaderCircle className='h-4 w-4 animate-spin' />
                  Guardando...
                </>
              ) : (
                <>
                  <Upload className='h-4 w-4' />
                  Añadir imagen
                </>
              )}
            </button>
          </form>
        </section>
      ) : null}
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

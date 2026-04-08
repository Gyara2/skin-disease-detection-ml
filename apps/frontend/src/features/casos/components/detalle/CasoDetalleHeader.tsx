import { ArrowLeft, Settings2, Sparkles, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type DetalleSection = 'resumen' | 'analisis' | 'gestion';

interface CasoDetalleHeaderProps {
  casoId: string;
  estadoLabel: string;
  estadoColor: string;
  pacienteNombre: string;
  esPaciente: boolean;
  activeSection: DetalleSection;
  canViewAI: boolean;
  canManage: boolean;
}

export const CasoDetalleHeader = ({
  casoId,
  estadoLabel,
  estadoColor,
  pacienteNombre,
  esPaciente,
  activeSection,
  canViewAI,
  canManage,
}: CasoDetalleHeaderProps) => (
  <header className='relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
    <div className='grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center'>
      <div className='space-y-2'>
        <Link
          to='/casos'
          className='flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-sky-600'
        >
          <ArrowLeft className='h-3 w-3' /> Volver a mi lista
        </Link>
        <h1 className='text-3xl font-black tracking-tight text-slate-900'>
          Caso #{casoId}
        </h1>
        <p className='font-medium text-slate-500'>
          {esPaciente ? 'Tu seguimiento médico' : `Paciente: ${pacienteNombre}`}
        </p>
      </div>
      <div
        className={`w-fit rounded-2xl px-4 py-2 text-sm font-bold shadow-sm md:justify-self-end ${estadoColor}`}
      >
        {estadoLabel}
      </div>
    </div>

    <nav className='mt-8 flex w-full flex-wrap gap-1.5 rounded-2xl bg-slate-100 p-1.5'>
      <TabLink
        to={`/casos/${casoId}/resumen`}
        active={activeSection === 'resumen'}
        icon={<UserRound />}
        label='General'
      />

      {canViewAI && (
        <TabLink
          to={`/casos/${casoId}/analisis`}
          active={activeSection === 'analisis'}
          icon={<Sparkles />}
          label='Análisis IA'
        />
      )}

      {canManage && (
        <TabLink
          to={`/casos/${casoId}/gestion`}
          active={activeSection === 'gestion'}
          icon={<Settings2 />}
          label='Gestión médica'
        />
      )}
    </nav>
  </header>
);

const TabLink = ({
  to,
  active,
  icon,
  label,
}: {
  to: string;
  active: boolean;
  icon: ReactNode;
  label: string;
}) => (
  <Link
    to={to}
    className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 sm:min-w-[170px] ${
      active
        ? 'bg-white text-sky-700 shadow-sm ring-1 ring-slate-200'
        : 'text-slate-500 hover:text-slate-800'
    }`}
  >
    <span className={active ? 'text-sky-600' : 'text-slate-400'}>{icon}</span>
    {label}
  </Link>
);

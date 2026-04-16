import type { Caso } from '@/shared/types';

interface Permissions {
  canViewAI: boolean;
  canManage: boolean;
}

interface CasoHeaderOptions {
  caso: Caso;
  activeTab: string;
  onTabChange: (str: string) => void;
  permissions: Permissions;
}

export const CasoHeader = ({
  caso,
  activeTab,
  onTabChange,
  permissions,
}: CasoHeaderOptions) => (
  <header className='rounded-3xl border bg-white p-6 shadow-sm'>
    <div className='flex justify-between items-center'>
      <div>
        <h1 className='text-2xl font-bold'>Caso #{caso.id}</h1>
        <p className='text-slate-500'>{caso.pacienteNombre}</p>
      </div>
      <div
        className={`px-4 py-2 rounded-xl text-sm font-bold ${caso.estadoColor}`}
      >
        {caso.estadoLabel}
      </div>
    </div>

    <nav className='flex gap-2 mt-6 p-1 bg-slate-100 rounded-xl w-fit'>
      <TabButton
        active={activeTab === 'resumen'}
        onClick={() => onTabChange('resumen')}
        label='Resumen'
      />
      {permissions.canViewAI && (
        <TabButton
          active={activeTab === 'analisis'}
          onClick={() => onTabChange('analisis')}
          label='Análisis AI'
        />
      )}
      {permissions.canManage && (
        <TabButton
          active={activeTab === 'gestion'}
          onClick={() => onTabChange('gestion')}
          label='Gestión'
        />
      )}
    </nav>
  </header>
);

const TabButton = ({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) => (
  <button
    type='button'
    onClick={onClick}
    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
      active ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
    }`}
  >
    {label}
  </button>
);

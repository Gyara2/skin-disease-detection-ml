import type { EstadoCaso } from '@/shared/types';

export const estadoCasoMap: Record<
  EstadoCaso,
  { label: string; color: string }
> = {
  pendiente: {
    label: 'Pendiente',
    color: 'bg-amber-100 text-amber-800',
  },
  en_proceso: {
    label: 'En proceso',
    color: 'bg-sky-100 text-sky-800',
  },
  completado: {
    label: 'Completado',
    color: 'bg-emerald-100 text-emerald-800',
  },
};

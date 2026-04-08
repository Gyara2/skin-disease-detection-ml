import type { LucideIcon } from 'lucide-react';

export interface EstadoUiItem {
  label: string;
  badge: string;
  description: string;
}

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface SeccionNavegacion {
  id: string;
  label: string;
}

export interface CasoResumenCard {
  label: string;
  value: string | number;
  icon: LucideIcon;
}

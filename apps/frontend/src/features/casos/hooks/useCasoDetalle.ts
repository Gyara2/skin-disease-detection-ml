import type { CasoDetalle } from '../types/caso-detalle.types';
import { getCasoDetalle } from '../services/caso-detalle.service';
import { useQuery } from '@tanstack/react-query';

export const useCasoDetalle = (id: string) => {
  return useQuery<CasoDetalle>({
    queryKey: ['caso', id],
    queryFn: () => getCasoDetalle(id),
    enabled: !!id,
  });
};

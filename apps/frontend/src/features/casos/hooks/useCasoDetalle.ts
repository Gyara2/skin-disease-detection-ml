import { useQuery } from '@tanstack/react-query';
import type { CasoDetalle } from '@/shared/types';
import { getCasoDetalle } from '../services/caso.service';

export const useCasoDetalle = (id: string) => {
  return useQuery<CasoDetalle>({
    queryKey: ['caso', id],
    queryFn: () => getCasoDetalle(id),
    enabled: !!id,
  });
};

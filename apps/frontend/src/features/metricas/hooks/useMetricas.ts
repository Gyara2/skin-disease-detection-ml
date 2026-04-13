import { useQuery } from '@tanstack/react-query';
import type { Metricas } from '@/shared/types';
import { getMetricas } from '../services/metricas.service';

export const useMetricas = () => {
  return useQuery<Metricas>({
    queryKey: ['metricas-modelo'],
    queryFn: getMetricas,
  });
};

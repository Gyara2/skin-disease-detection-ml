import { useQuery } from '@tanstack/react-query';
import type { Caso } from '@/shared/types';
import { getCasos } from '../services/caso.service';

export const useCasos = () => {
  return useQuery<Caso[]>({
    queryKey: ['casos'],
    queryFn: getCasos,
  });
};

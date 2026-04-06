import { getCasos } from '../services/casos.service';
import type { Caso } from '../types/caso.types';
import { useQuery } from '@tanstack/react-query';

export const useCasos = () => {
  return useQuery<Caso[]>({
    queryKey: ['casos'],
    queryFn: getCasos,
  });
};

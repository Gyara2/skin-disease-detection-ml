import { useQuery } from '@tanstack/react-query';
import type { Resumen } from '@/shared/types';
import { getResumen } from '../services/resumen.service';

export const useResumen = () => {
  return useQuery<Resumen>({
    queryKey: ['resumen'],
    queryFn: getResumen,
  });
};

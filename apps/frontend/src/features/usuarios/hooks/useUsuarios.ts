import { useQuery } from '@tanstack/react-query';
import type { Usuario } from '@/shared/types';
import { getUsuarios } from '../services/usuario.service';

export const useUsuarios = () => {
  return useQuery<Usuario[]>({
    queryKey: ['usuarios'],
    queryFn: getUsuarios,
  });
};

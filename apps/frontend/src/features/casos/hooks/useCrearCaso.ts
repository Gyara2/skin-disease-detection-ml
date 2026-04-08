import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CrearCasoInput } from '@/shared/types';
import { crearCaso } from '../services/caso.service';

export const useCrearCaso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CrearCasoInput) => crearCaso(input),
    onSuccess: (casoDetalle) => {
      queryClient.invalidateQueries({ queryKey: ['casos'] });
      queryClient.setQueryData(['caso', casoDetalle.id], casoDetalle);
    },
  });
};

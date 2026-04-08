import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CrearValidacionInput } from '@/shared/types';
import { crearValidacion } from '../services/caso.service';

interface CrearValidacionMutationInput {
  casoId: string;
  input: CrearValidacionInput;
}

export const useCrearValidacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ casoId, input }: CrearValidacionMutationInput) =>
      crearValidacion(casoId, input),
    onSuccess: (casoDetalle) => {
      queryClient.invalidateQueries({ queryKey: ['casos'] });
      queryClient.setQueryData(['caso', casoDetalle.id], casoDetalle);
    },
  });
};

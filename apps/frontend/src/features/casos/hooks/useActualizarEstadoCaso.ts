import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ActualizarEstadoCasoInput } from '@/shared/types';
import { actualizarEstadoCaso } from '../services/caso.service';

interface ActualizarEstadoCasoMutationInput {
  casoId: string;
  input: ActualizarEstadoCasoInput;
}

export const useActualizarEstadoCaso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ casoId, input }: ActualizarEstadoCasoMutationInput) =>
      actualizarEstadoCaso(casoId, input),
    onSuccess: (casoDetalle) => {
      queryClient.invalidateQueries({ queryKey: ['casos'] });
      queryClient.setQueryData(['caso', casoDetalle.id], casoDetalle);
    },
  });
};

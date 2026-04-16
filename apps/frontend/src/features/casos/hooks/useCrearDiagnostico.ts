import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CrearDiagnosticoInput } from '@/shared/types';
import { crearDiagnostico } from '../services/caso.service';

interface CrearDiagnosticoMutationInput {
  casoId: string;
  input: CrearDiagnosticoInput;
}

export const useCrearDiagnostico = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ casoId, input }: CrearDiagnosticoMutationInput) =>
      crearDiagnostico(casoId, input),
    onSuccess: (casoDetalle) => {
      queryClient.invalidateQueries({ queryKey: ['casos'] });
      queryClient.setQueryData(['caso', casoDetalle.id], casoDetalle);
    },
  });
};

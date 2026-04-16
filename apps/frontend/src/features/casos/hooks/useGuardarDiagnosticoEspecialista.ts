import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { GuardarDiagnosticoEspecialistaInput } from '@/shared/types';
import { guardarDiagnosticoEspecialista } from '../services/caso.service';

interface GuardarDiagnosticoEspecialistaMutationInput {
  casoId: string;
  input: GuardarDiagnosticoEspecialistaInput;
}

export const useGuardarDiagnosticoEspecialista = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ casoId, input }: GuardarDiagnosticoEspecialistaMutationInput) =>
      guardarDiagnosticoEspecialista(casoId, input),
    onSuccess: (casoDetalle) => {
      queryClient.invalidateQueries({ queryKey: ['casos'] });
      queryClient.setQueryData(['caso', casoDetalle.id], casoDetalle);
    },
  });
};


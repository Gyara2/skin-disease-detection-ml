import { useMutation, useQueryClient } from '@tanstack/react-query';
import { agregarImagenCaso } from '../services/caso.service';

interface AgregarImagenCasoInput {
  casoId: string;
  pacienteId: string;
  especialistaId: string;
  imagenBase64: string;
}

export const useAgregarImagenCaso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AgregarImagenCasoInput) =>
      agregarImagenCaso(
        input.casoId,
        input.pacienteId,
        input.especialistaId,
        input.imagenBase64,
      ),
    onSuccess: (casoDetalle) => {
      queryClient.invalidateQueries({ queryKey: ['casos'] });
      queryClient.setQueryData(['caso', casoDetalle.id], casoDetalle);
    },
  });
};

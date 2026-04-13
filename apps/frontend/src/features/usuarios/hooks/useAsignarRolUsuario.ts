import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AsignarRolUsuarioInput } from '@/shared/types';
import { asignarRolUsuario } from '../services/usuario.service';

interface AsignarRolUsuarioVariables {
  usuarioId: string;
  input: AsignarRolUsuarioInput;
}

export const useAsignarRolUsuario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ usuarioId, input }: AsignarRolUsuarioVariables) =>
      asignarRolUsuario(usuarioId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
};

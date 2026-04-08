import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CrearUsuarioInput } from '@/shared/types';
import { crearUsuario } from '../services/usuario.service';

export const useCrearUsuario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CrearUsuarioInput) => crearUsuario(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
};

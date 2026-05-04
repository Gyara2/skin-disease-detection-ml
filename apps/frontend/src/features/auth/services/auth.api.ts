import { apiPost } from '@/shared/lib/api';
import type { LoginInput, LoginResponse, Usuario } from '@/shared/types';

export const loginFromApi = (input: LoginInput) => {
  return apiPost<LoginResponse, LoginInput>(
    '/LogIn',
    input,
    'Credenciales incorrectas',
  );
};

export const mapLoginResponseToUsuario = (response: LoginResponse): Usuario => {
  return {
    id: String(response.id),
    dni: '',
    nombre: response.nombre,
    apellido1: response.apellido1,
    apellido2: response.apellido2,
    email: response.email,
    rol: response.rol,
    rolId: response.rolId,
    creado: '',
    actualizado: '',
  };
};
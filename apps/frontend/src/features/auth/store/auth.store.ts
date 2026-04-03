import { create } from 'zustand';

export type Rol = 'PACIENTE' | 'ESPECIALISTA' | 'ADMIN';

export interface Usuario {
  id: string;
  nombre: string;
  rol: Rol;
}

interface AuthState {
  usuario: Usuario | null;
  isAuthenticated: boolean;

  login: (usuario: Usuario) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  usuario: null,
  isAuthenticated: false,

  login: (usuario) =>
    set({
      usuario,
      isAuthenticated: true,
    }),

  logout: () =>
    set({
      usuario: null,
      isAuthenticated: false,
    }),
}));

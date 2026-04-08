import { create } from 'zustand';
import type { Usuario } from '@/shared/types';

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

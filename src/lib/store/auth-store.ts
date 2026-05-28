import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Usuario, Perfil } from '@/types';
import { MOCK_USERS, MOCK_CREDENTIALS } from '@/lib/mock-data';

function setAuthCookie(role: Perfil | null) {
  if (typeof document === 'undefined') return;
  if (role) {
    document.cookie = `gympro-auth-role=${role}; path=/; SameSite=Lax; max-age=86400`;
  } else {
    document.cookie = 'gympro-auth-role=; path=/; max-age=0';
  }
}

interface AuthStore {
  user: Usuario | null;
  estaAutenticado: boolean;
  carregando: boolean;

  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsRole: (role: Perfil) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAutenticacaoStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      estaAutenticado: false,
      carregando: false,

      login: async (email, password) => {
        set({ carregando: true });
        await new Promise((resolve) => setTimeout(resolve, 800));

        const credential = MOCK_CREDENTIALS[email.toLowerCase()];
        if (!credential || credential.password !== password) {
          set({ carregando: false });
          return { success: false, error: 'E-mail ou senha incorretos.' };
        }

        const user = MOCK_USERS.find((u) => u.id === credential.usuarioId);
        if (!user) {
          set({ carregando: false });
          return { success: false, error: 'Usuário não encontrado.' };
        }

        set({ user, estaAutenticado: true, carregando: false });
        setAuthCookie(user.role);
        return { success: true };
      },

      loginAsRole: (role) => {
        const user = MOCK_USERS.find((u) => u.role === role);
        if (user) {
          set({ user, estaAutenticado: true });
          setAuthCookie(user.role);
        }
      },

      logout: () => {
        set({ user: null, estaAutenticado: false });
        setAuthCookie(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('gympro-auth');
          window.location.href = '/';
        }
      },

      setLoading: (loading) => set({ carregando: loading }),
    }),
    {
      name: 'gympro-auth',
      partialize: (state) => ({ user: state.user, estaAutenticado: state.estaAutenticado }),
    }
  )
);

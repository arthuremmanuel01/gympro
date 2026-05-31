import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Usuario, Perfil } from '@/types';

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
  loginAsRole: (role: Perfil) => Promise<void>;
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
        try {
          const resposta = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const dados = await resposta.json();

          if (!resposta.ok || !dados.success) {
            set({ carregando: false });
            return { success: false, error: dados.error || 'Falha na autenticação.' };
          }

          set({ user: dados.user, estaAutenticado: true, carregando: false });
          setAuthCookie(dados.user.role);
          return { success: true };
        } catch (error) {
          set({ carregando: false });
          return { success: false, error: 'Erro de conexão com o servidor.' };
        }
      },

      loginAsRole: async (role) => {
        set({ carregando: true });
        try {
          const resposta = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role }),
          });

          const dados = await resposta.json();

          if (resposta.ok && dados.success && dados.user) {
            set({ user: dados.user, estaAutenticado: true, carregando: false });
            setAuthCookie(dados.user.role);
          } else {
            set({ carregando: false });
          }
        } catch (error) {
          set({ carregando: false });
          console.error('Erro ao alternar perfil:', error);
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
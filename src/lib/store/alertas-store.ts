import { create } from 'zustand';
import type { AlertaAcademia, Perfil } from '@/types';

interface AlertsStore {
  alertas: AlertaAcademia[];
  carregando: boolean;
  fetchAlerts: () => Promise<void>;
  getUnreadCount: () => number;
  getAlertsForRole: (role: Perfil) => AlertaAcademia[];
}

export const useAlertsStore = create<AlertsStore>((set, get) => ({
  alertas: [],
  carregando: false,

  fetchAlerts: async () => {
    set({ carregando: true });
    try {
      const resposta = await fetch('/api/alertas');
      if (resposta.ok) {
        const dados = await resposta.json();
        set({ alertas: dados, carregando: false });
      } else {
        set({ carregando: false });
      }
    } catch (error) {
      console.error('Erro na requisição de alertas:', error);
      set({ carregando: false });
    }
  },

  getUnreadCount: () => get().alertas.filter((a) => !a.lido).length,

  getAlertsForRole: (role) =>
    get().alertas.filter((a) => a.perfilAlvo === 'todos' || a.perfilAlvo === role),
}));
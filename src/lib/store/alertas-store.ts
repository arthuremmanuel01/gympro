import { create } from 'zustand';
import type { AlertaAcademia, Perfil } from '@/types';
import { MOCK_ALERTS } from '@/lib/mock-data';

interface AlertsStore {
  alertas: AlertaAcademia[];
  marcarComoLido: (id: string) => void;
  marcarTodosComoLidos: () => void;
  addAlert: (alert: Omit<AlertaAcademia, 'id' | 'criadoEm'>) => void;
  getUnreadCount: () => number;
  getAlertsForRole: (role: Perfil) => AlertaAcademia[];
}

export const useAlertsStore = create<AlertsStore>((set, get) => ({
  alertas: MOCK_ALERTS,

  marcarComoLido: (id) =>
    set((state) => ({
      alertas: state.alertas.map((a) => (a.id === id ? { ...a, lido: true } : a)),
    })),

  marcarTodosComoLidos: () =>
    set((state) => ({
      alertas: state.alertas.map((a) => ({ ...a, lido: true })),
    })),

  addAlert: (alert) =>
    set((state) => ({
      alertas: [
        {
          ...alert,
          id: `alert-${Date.now()}`,
          criadoEm: new Date().toISOString(),
          lido: false,
        },
        ...state.alertas,
      ],
    })),

  getUnreadCount: () => get().alertas.filter((a) => !a.lido).length,

  getAlertsForRole: (role) =>
    get().alertas.filter((a) => a.perfilAlvo === 'todos' || a.perfilAlvo === role),
}));

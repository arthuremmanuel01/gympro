import { create } from 'zustand';
import type { SolicitacaoManutencao, StatusManutencao } from '@/types';
import { MOCK_MAINTENANCE_REQUESTS } from '@/lib/mock-data';

interface MaintenanceStore {
  solicitacoes: SolicitacaoManutencao[];
  updateStatus: (id: string, status: StatusManutencao, notes?: string) => void;
  addRequest: (request: Omit<SolicitacaoManutencao, 'id' | 'criadoEm'>) => void;
  getPendingRequests: () => SolicitacaoManutencao[];
}

export const useMaintenanceStore = create<MaintenanceStore>((set, get) => ({
  solicitacoes: MOCK_MAINTENANCE_REQUESTS,

  updateStatus: (id, status, notes) =>
    set((state) => ({
      solicitacoes: state.solicitacoes.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              notes: notes ?? r.notes,
              resolvidoEm:
                status === 'concluida' || status === 'rejeitada'
                  ? new Date().toISOString()
                  : r.resolvidoEm,
            }
          : r
      ),
    })),

  addRequest: (request) =>
    set((state) => ({
      solicitacoes: [
        {
          ...request,
          id: `maint-${Date.now()}`,
          criadoEm: new Date().toISOString(),
        },
        ...state.solicitacoes,
      ],
    })),

  getPendingRequests: () => get().solicitacoes.filter((r) => r.status === 'pendente'),
}));

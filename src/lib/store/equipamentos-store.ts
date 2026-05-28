import { create } from 'zustand';
import type { Equipamento, StatusEquipamento } from '@/types';
import { MOCK_EQUIPMENT } from '@/lib/mock-data';

interface EquipmentStore {
  equipamentos: Equipamento[];
  updateStatus: (id: string, status: StatusEquipamento, notes?: string) => void;
  addEquipment: (equipamentos: Equipamento) => void;
  getById: (id: string) => Equipamento | undefined;
}

export const useEquipmentStore = create<EquipmentStore>((set, get) => ({
  equipamentos: MOCK_EQUIPMENT,

  updateStatus: (id, status, notes) =>
    set((state) => ({
      equipamentos: state.equipamentos.map((eq) =>
        eq.id === id ? { ...eq, status, notes: notes ?? eq.notes } : eq
      ),
    })),

  addEquipment: (equipamentos) =>
    set((state) => ({
      equipamentos: [...state.equipamentos, equipamentos],
    })),

  getById: (id) => get().equipamentos.find((eq) => eq.id === id),
}));

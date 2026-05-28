'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEquipmentStore } from '@/lib/store/equipamentos-store';
import type { Equipamento, StatusEquipamento } from '@/types';

export function useEquipamentos() {
  const equipamentos = useEquipmentStore((s) => s.equipamentos);
  return useQuery({
    queryKey: ['equipamentos', equipamentos.length, equipamentos.map((e) => e.status).join(',')],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300));
      return equipamentos;
    },
    staleTime: Infinity,
  });
}

export function useUpdateEquipmentStatus() {
  const queryClient = useQueryClient();
  const updateStatus = useEquipmentStore((s) => s.updateStatus);
  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: StatusEquipamento;
      notes?: string;
    }) => {
      await new Promise((r) => setTimeout(r, 400));
      updateStatus(id, status, notes);
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos'] });
    },
  });
}

export function useAddEquipment() {
  const queryClient = useQueryClient();
  const addEquipment = useEquipmentStore((s) => s.addEquipment);
  return useMutation({
    mutationFn: async (equipamentos: Equipamento) => {
      await new Promise((r) => setTimeout(r, 500));
      addEquipment(equipamentos);
      return equipamentos;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos'] });
    },
  });
}

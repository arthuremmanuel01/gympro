'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Equipamento } from '@/types';

export function useEquipamentos() {
  return useQuery({
    queryKey: ['equipamentos'],
    queryFn: async (): Promise<Equipamento[]> => {
      const res = await fetch('/api/equipamentos');
      if (!res.ok) throw new Error('Falha ao buscar equipamentos');
      return res.json();
    },
  });
}

export function useAddEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (equipamento: Partial<Equipamento>) => {
      const res = await fetch('/api/equipamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipamento),
      });
      if (!res.ok) throw new Error('Falha ao adicionar equipamento');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos'] });
    },
  });
}

export function useRemoveEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/equipamentos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao remover equipamento');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos'] });
    },
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
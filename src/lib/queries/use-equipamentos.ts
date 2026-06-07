'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Equipamento, StatusEquipamento } from '@/types';

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
      toast.success('Equipamento cadastrado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao cadastrar equipamento. Tente novamente.');
    },
  });
}

export function useRemoveEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/equipamentos/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Falha ao remover equipamento');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos'] });
      toast.success('Equipamento removido do inventário com sucesso.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao remover equipamento. Tente novamente.');
    },
  });
}

export function useUpdateEquipmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
      urgencyLevel,
    }: {
      id: string;
      status: StatusEquipamento;
      notes?: string;
      urgencyLevel?: string;
    }) => {
      const res = await fetch(`/api/equipamentos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes, urgencyLevel }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Falha ao atualizar status do equipamento');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos'] });
      toast.success('Status do equipamento atualizado!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar equipamento.');
    },
  });
}
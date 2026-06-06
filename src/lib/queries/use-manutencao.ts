'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SolicitacaoManutencao, StatusManutencao } from '@/types';

export function useMaintenanceRequests() {
  return useQuery<SolicitacaoManutencao[]>({
    queryKey: ['maintenance'],
    queryFn: async () => {
      const res = await fetch('/api/manutencao');
      if (!res.ok) throw new Error('Falha ao carregar manutenções');
      return res.json();
    }
  });
}

export function useUpdateMaintenanceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: StatusManutencao;
      notes?: string;
    }) => {
      const res = await fetch(`/api/manutencao/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });
      if (!res.ok) throw new Error('Falha ao atualizar status de manutenção');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['equipamentos'] });
    },
  });
}
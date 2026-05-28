'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMaintenanceStore } from '@/lib/store/manutencao-store';
import type { SolicitacaoManutencao, StatusManutencao } from '@/types';

export function useMaintenanceRequests() {
  const solicitacoes = useMaintenanceStore((s) => s.solicitacoes);
  return useQuery({
    queryKey: ['maintenance', solicitacoes.length, solicitacoes.map((r) => r.status).join(',')],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300));
      return solicitacoes;
    },
    staleTime: Infinity,
  });
}

export function useUpdateMaintenanceStatus() {
  const queryClient = useQueryClient();
  const updateStatus = useMaintenanceStore((s) => s.updateStatus);
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
      await new Promise((r) => setTimeout(r, 500));
      updateStatus(id, status, notes);
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });
}

export function useAddMaintenanceRequest() {
  const queryClient = useQueryClient();
  const addRequest = useMaintenanceStore((s) => s.addRequest);
  return useMutation({
    mutationFn: async (request: Omit<SolicitacaoManutencao, 'id' | 'criadoEm'>) => {
      await new Promise((r) => setTimeout(r, 600));
      addRequest(request);
      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });
}

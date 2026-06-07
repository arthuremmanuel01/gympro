'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { PlanoTreinoCompleto } from '@/types';



export function usePlanoTreinoCompleto(planoId: string | undefined | null) {
  return useQuery({
    queryKey: ['plano-treino-completo', planoId],
    queryFn: async (): Promise<PlanoTreinoCompleto | null> => {
      if (!planoId) return null;
      const res = await fetch(`/api/planos-treino?id=${encodeURIComponent(planoId)}`);
      if (!res.ok) throw new Error('Falha ao buscar o plano de treino.');
      return res.json();
    },
    enabled: Boolean(planoId),
    staleTime: 10_000,
  });
}



export interface CriarPlanoPayload {
  name: string;
  alunoId: string;
  professorId: string;
  dificuldade: 'iniciante' | 'intermediario' | 'avancado';
  diasPorSemana: number;
  objetivo?: string;
  divisoes: Array<{
    nome: string;
    exercicios: Array<{
      nome: string;
      grupoMuscular: string;
      equipamentoId?: string;
      series: number;
      repeticoes: string;
      pesoKg?: number;
      segundosDescanso: number;
      observacoes?: string;
    }>;
  }>;
}

export function useCriarPlanoCompleto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CriarPlanoPayload) => {
      const res = await fetch('/api/planos-treino', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erro ao criar o plano de treino.');
      }
      return res.json() as Promise<{ success: boolean; id: string; plano: PlanoTreinoCompleto }>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['plano-treino-completo', data.id] });
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['alunos', 'solicitacoes-ficha'] });
      // Invalida chaves legadas também
      queryClient.invalidateQueries({ queryKey: ['workout-planos'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao criar plano de treino.');
    },
  });
}



export function useAtualizarPlanoCompleto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CriarPlanoPayload & { id: string }) => {
      const res = await fetch('/api/planos-treino', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erro ao atualizar o plano de treino.');
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plano-treino-completo', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['workout-planos'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao atualizar plano de treino.');
    },
  });
}

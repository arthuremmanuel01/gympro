'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Aluno } from '@/types';

/** Busca todos os alunos da academia com solicitação de ficha pendente */
export function useSolicitacoesFicha() {
  return useQuery({
    queryKey: ['alunos', 'solicitacoes-ficha'],
    queryFn: async (): Promise<Aluno[]> => {
      const res = await fetch('/api/alunos?solicitacoesFicha=true');
      if (!res.ok) throw new Error('Falha ao buscar solicitações de ficha.');
      return res.json();
    },
    staleTime: 30_000,
  });
}

/** Busca os alunos distintos que o professor já atendeu (histórico de fichas criadas/editadas) */
export function useAlunosAtendidosPorProfessor(professorId: string) {
  return useQuery({
    queryKey: ['alunos', 'historico-professor', professorId],
    queryFn: async (): Promise<Aluno[]> => {
      const res = await fetch(`/api/planos-treino?professorId=${encodeURIComponent(professorId)}`);
      if (!res.ok) throw new Error('Falha ao buscar histórico de alunos.');
      return res.json();
    },
    enabled: Boolean(professorId),
    staleTime: 60_000,
  });
}

/** Aluno solicita criação ou atualização de ficha de treino */
export function useSolicitarFicha() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      alunoId,
      tipoSolicitacao,
    }: {
      alunoId: string;
      tipoSolicitacao: 'nova' | 'atualizacao';
    }) => {
      const res = await fetch('/api/alunos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: alunoId,
          action: 'solicitar-ficha',
          tipoSolicitacao,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erro ao registrar solicitação.');
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['alunos', 'by-user'] });
      queryClient.invalidateQueries({ queryKey: ['alunos', 'solicitacoes-ficha'] });
      const msg =
        variables.tipoSolicitacao === 'nova'
          ? 'Solicitação de nova ficha enviada! Aguarde seu professor.'
          : 'Solicitação de atualização de ficha enviada! Aguarde seu professor.';
      toast.success(msg);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Não foi possível enviar a solicitação.');
    },
  });
}

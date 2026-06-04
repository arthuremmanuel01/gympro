'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTreinoStore } from '@/lib/store/treino-store';
import type { PlanoTreino } from '@/types';

export function usePlanosTreino() {
  const planos = useTreinoStore((s) => s.planos);
  return useQuery({
    queryKey: ['workout-planos', planos.length],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300));
      return planos;
    },
    staleTime: Infinity,
  });
}

export function usePlanoTreino(planId: string | undefined) {
  return useQuery({
    queryKey: ['workout-planos', planId],
    queryFn: async () => {
      const resposta = await fetch(`/api/planos-treino?id=${planId}`);
      if (!resposta.ok) throw new Error('Falha ao buscar o plano de treino do servidor.');
      return resposta.json() as Promise<PlanoTreino | null>;
    },
    enabled: Boolean(planId),
    staleTime: 10_000,
  });
}

export function useWorkoutPlansByStudent(alunoId: string) {
  const planos = useTreinoStore((s) => s.planos);
  const filtered = planos.filter((p) => p.alunoId === alunoId);
  return useQuery({
    queryKey: ['workout-planos', 'by-student', alunoId, filtered.length],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      return filtered;
    },
    enabled: Boolean(alunoId),
    staleTime: Infinity,
  });
}

export function useUpdateWorkoutPlan() {
  const queryClient = useQueryClient();
  const updatePlan = useTreinoStore((s) => s.updatePlan);

  return useMutation({
    mutationFn: async (plan: PlanoTreino) => {
      const resposta = await fetch('/api/planos-treino', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plan),
      });

      if (!resposta.ok) {
        throw new Error('Falha ao atualizar o plano de treino no servidor.');
      }

      updatePlan(plan);
      return plan;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workout-planos'] });
      queryClient.invalidateQueries({ queryKey: ['workout-planos', data.id] });
    },
  });
}

export function useAddWorkoutPlan() {
  const queryClient = useQueryClient();
  const addPlan = useTreinoStore((s) => s.addPlan);

  return useMutation({
    mutationFn: async (plan: PlanoTreino) => {
      const resposta = await fetch('/api/planos-treino', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plan),
      });

      if (!resposta.ok) {
        throw new Error('Falha ao criar o plano de treino no servidor.');
      }

      addPlan(plan);
      return plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-planos'] });
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
    },
  });
}

export function useDeleteWorkoutPlan() {
  const queryClient = useQueryClient();
  const deletePlan = useTreinoStore((s) => s.deletePlan);
  return useMutation({
    mutationFn: async (planId: string) => {
      await new Promise((r) => setTimeout(r, 400));
      deletePlan(planId);
      return planId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-planos'] });
    },
  });
}

export function useConcluirTreino() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { alunoId: string; planoTreinoId: string; exerciciosConcluidos: string[] }) => {
      const resposta = await fetch('/api/treinos/concluir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!resposta.ok) {
        throw new Error('Falha ao concluir o treino no servidor.');
      }

      return resposta.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
    },
  });
}
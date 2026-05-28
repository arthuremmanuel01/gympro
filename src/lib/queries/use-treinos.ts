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
  const planos = useTreinoStore((s) => s.planos);
  const plan = planId ? planos.find((p) => p.id === planId) ?? null : null;
  return useQuery({
    queryKey: ['workout-planos', planId, plan?.exercicios.length],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      return plan;
    },
    enabled: Boolean(planId),
    staleTime: Infinity,
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
      await new Promise((r) => setTimeout(r, 500));
      updatePlan(plan);
      return plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-planos'] });
    },
  });
}

export function useAddWorkoutPlan() {
  const queryClient = useQueryClient();
  const addPlan = useTreinoStore((s) => s.addPlan);
  return useMutation({
    mutationFn: async (plan: PlanoTreino) => {
      await new Promise((r) => setTimeout(r, 600));
      addPlan(plan);
      return plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-planos'] });
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

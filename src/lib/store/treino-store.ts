import { create } from 'zustand';
import type { PlanoTreino, Exercicio } from '@/types';
import { MOCK_WORKOUT_PLANS } from '@/lib/mock-data';

interface WorkoutStore {
  planos: PlanoTreino[];
  activeSessionPlanId: string | null;
  progressoExercicio: Record<string, number>;

  setActiveSession: (planId: string | null) => void;
  marcarSerie: (exerciseId: string, totalSets: number) => void;
  reiniciarSessao: (exercicios: Exercicio[]) => void;
  updatePlan: (plan: PlanoTreino) => void;
  addPlan: (plan: PlanoTreino) => void;
  deletePlan: (planId: string) => void;
  getPlanById: (planId: string) => PlanoTreino | undefined;
  getPlansByStudent: (alunoId: string) => PlanoTreino[];
}

export const useTreinoStore = create<WorkoutStore>((set, get) => ({
  planos: MOCK_WORKOUT_PLANS,
  activeSessionPlanId: null,
  progressoExercicio: {},

  setActiveSession: (planId) => set({ activeSessionPlanId: planId }),

  marcarSerie: (exerciseId, totalSets) =>
    set((state) => {
      const current = state.progressoExercicio[exerciseId] ?? 0;
      const next = current < totalSets ? current + 1 : 0;
      return { progressoExercicio: { ...state.progressoExercicio, [exerciseId]: next } };
    }),

  reiniciarSessao: (exercicios) => {
    const reset: Record<string, number> = {};
    exercicios.forEach((ex) => {
      reset[ex.id] = 0;
    });
    set({ progressoExercicio: reset });
  },

  updatePlan: (plan) =>
    set((state) => ({
      planos: state.planos.map((p) => (p.id === plan.id ? plan : p)),
    })),

  addPlan: (plan) =>
    set((state) => ({
      planos: [...state.planos, plan],
    })),

  deletePlan: (planId) =>
    set((state) => ({
      planos: state.planos.filter((p) => p.id !== planId),
    })),

  getPlanById: (planId) => get().planos.find((p) => p.id === planId),

  getPlansByStudent: (alunoId) => get().planos.filter((p) => p.alunoId === alunoId),
}));

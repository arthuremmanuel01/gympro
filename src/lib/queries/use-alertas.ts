'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAlertsStore } from '@/lib/store/alertas-store';
import type { AlertaAcademia, Perfil } from '@/types';

export function useAlertas() {
  const alertas = useAlertsStore((s) => s.alertas);
  return useQuery({
    queryKey: ['alertas', alertas.length, alertas.filter((a) => a.lido).length],
    queryFn: async () => {
      return alertas;
    },
    staleTime: Infinity,
  });
}

export function useAlertsForRole(role: Perfil) {
  const alertas = useAlertsStore((s) => s.alertas);
  const filtered = alertas.filter(
    (a) => a.perfilAlvo === 'todos' || a.perfilAlvo === role
  );
  return useQuery({
    queryKey: ['alertas', 'role', role, filtered.length, filtered.filter((a) => a.lido).length],
    queryFn: async () => {
      return filtered;
    },
    enabled: Boolean(role),
    staleTime: Infinity,
  });
}

export function useMarkAlertRead() {
  const queryClient = useQueryClient();
  const marcarComoLido = useAlertsStore((s) => s.marcarComoLido);
  return useMutation({
    mutationFn: async (id: string) => {
      marcarComoLido(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas'] });
    },
  });
}

export function useAddAlert() {
  const queryClient = useQueryClient();
  const addAlert = useAlertsStore((s) => s.addAlert);
  return useMutation({
    mutationFn: async (alert: Omit<AlertaAcademia, 'id' | 'criadoEm'>) => {
      await new Promise((r) => setTimeout(r, 500));
      addAlert(alert);
      return alert;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas'] });
    },
  });
}

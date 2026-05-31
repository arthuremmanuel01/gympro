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
  const fetchAlerts = useAlertsStore((s) => s.fetchAlerts);

  return useMutation({
    mutationFn: async (id: string) => {
      const resposta = await fetch('/api/alertas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!resposta.ok) throw new Error('Falha ao marcar alerta como lido.');
    },
    onSuccess: async () => {
      await fetchAlerts();
      queryClient.invalidateQueries({ queryKey: ['alertas'] });
    },
  });
}

export function useMarkAllAlertsRead() {
  const queryClient = useQueryClient();
  const fetchAlerts = useAlertsStore((s) => s.fetchAlerts);

  return useMutation({
    mutationFn: async () => {
      const resposta = await fetch('/api/alertas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all' }),
      });
      if (!resposta.ok) throw new Error('Falha ao marcar todos como lido.');
    },
    onSuccess: async () => {
      await fetchAlerts();
      queryClient.invalidateQueries({ queryKey: ['alertas'] });
    },
  });
}

export function useAddAlert() {
  const queryClient = useQueryClient();
  const fetchAlerts = useAlertsStore((s) => s.fetchAlerts); 

  return useMutation({
    mutationFn: async (alert: Omit<AlertaAcademia, 'id' | 'criadoEm'>) => {
      const resposta = await fetch('/api/alertas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert),
      });

      if (!resposta.ok) {
        throw new Error('Falha ao criar o alerta no servidor.');
      }
      return resposta.json();
    },
    onSuccess: async () => {
      await fetchAlerts(); 
      queryClient.invalidateQueries({ queryKey: ['alertas'] });
    },
  });
}

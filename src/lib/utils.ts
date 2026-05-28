import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { StatusPagamento, StatusEquipamento, TipoAlerta, StatusManutencao } from '@/types';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `há ${diffMins} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays === 1) return 'ontem';
  return `há ${diffDays} dias`;
}

export function getPaymentStatusLabel(status: StatusPagamento): string {
  const labels: Record<StatusPagamento, string> = {
    adimplente: 'Adimplente',
    inadimplente: 'Inadimplente',
    pendente: 'Pendente',
  };
  return labels[status];
}

export function getPaymentStatusColor(status: StatusPagamento): string {
  const colors: Record<StatusPagamento, string> = {
    adimplente: 'text-emerald-400',
    inadimplente: 'text-red-400',
    pendente: 'text-amber-400',
  };
  return colors[status];
}

export function getPaymentStatusBg(status: StatusPagamento): string {
  const colors: Record<StatusPagamento, string> = {
    adimplente: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
    inadimplente: 'bg-red-500/15 text-red-400 ring-red-500/30',
    pendente: 'bg-amber-500/15 text-amber-400 ring-amber-500/30',
  };
  return colors[status];
}

export function getEquipmentStatusLabel(status: StatusEquipamento): string {
  const labels: Record<StatusEquipamento, string> = {
    funcionando: 'Funcionando',
    manutencao: 'Em Manutenção',
    quebrado: 'Quebrado',
  };
  return labels[status];
}

export function getEquipmentStatusColor(status: StatusEquipamento): string {
  const colors: Record<StatusEquipamento, string> = {
    funcionando: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
    manutencao: 'bg-amber-500/15 text-amber-400 ring-amber-500/30',
    quebrado: 'bg-red-500/15 text-red-400 ring-red-500/30',
  };
  return colors[status];
}

export function getAlertTypeColor(type: TipoAlerta): string {
  const colors: Record<TipoAlerta, string> = {
    info: 'border-blue-500/40 bg-blue-500/10',
    warning: 'border-amber-500/40 bg-amber-500/10',
    danger: 'border-red-500/40 bg-red-500/10',
    success: 'border-emerald-500/40 bg-emerald-500/10',
  };
  return colors[type];
}

export function getAlertTypeIconColor(type: TipoAlerta): string {
  const colors: Record<TipoAlerta, string> = {
    info: 'text-blue-400',
    warning: 'text-amber-400',
    danger: 'text-red-400',
    success: 'text-emerald-400',
  };
  return colors[type];
}

export function getMaintenanceStatusLabel(status: StatusManutencao): string {
  const labels: Record<StatusManutencao, string> = {
    pendente: 'Pendente',
    aprovada: 'Aprovada',
    rejeitada: 'Rejeitada',
    concluida: 'Concluída',
  };
  return labels[status];
}

export function getMaintenanceStatusBg(status: StatusManutencao): string {
  const colors: Record<StatusManutencao, string> = {
    pendente: 'bg-amber-500/15 text-amber-400 ring-amber-500/30',
    aprovada: 'bg-blue-500/15 text-blue-400 ring-blue-500/30',
    rejeitada: 'bg-red-500/15 text-red-400 ring-red-500/30',
    concluida: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
  };
  return colors[status];
}

export function getPriorityLabel(priority: 'baixa' | 'media' | 'alta'): string {
  const labels = { baixa: 'Baixa', media: 'Média', alta: 'Alta' };
  return labels[priority];
}

export function getPriorityColor(priority: 'baixa' | 'media' | 'alta'): string {
  const colors = {
    baixa: 'bg-slate-500/15 text-slate-400 ring-slate-500/30',
    media: 'bg-amber-500/15 text-amber-400 ring-amber-500/30',
    alta: 'bg-red-500/15 text-red-400 ring-red-500/30',
  };
  return colors[priority];
}

export function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { SkeletonList } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import {
  Users,
  TrendingUp,
  Wrench,
  DollarSign,
  AlertTriangle,
  UserPlus,
  Activity,
} from 'lucide-react';

interface DashboardData {
  kpi: {
    alunosAtivos: number;
    totalAlunos: number;
    receitaMensalBRL: number;
    taxaInadimplenciaPercentual: number;
    frequenciaMediaPorDia: number;
    novosAlunosEsteMes: number;
    problemasEquipamento: number;
    totalEquipamentos: number;
    manutencoesPendentes: number;
  };
  revenueData: Array<{ month: string; receita: number; esperado: number; inadimplencia: number }>;
}

export default function GerenciaDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/gerencia/dashboard');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return <SkeletonList count={3} />;
  }

  const kpis = [
    {
      label: 'Alunos Ativos',
      value: data.kpi.alunosAtivos,
      total: data.kpi.totalAlunos,
      icon: Users,
      color: 'var(--color-primary)',
      bg: 'var(--color-primary-muted)',
      unit: '',
    },
    {
      label: 'Receita do Mês',
      value: data.kpi.receitaMensalBRL,
      total: null,
      icon: DollarSign,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)',
      unit: 'currency',
    },
    {
      label: 'Inadimplência',
      value: data.kpi.taxaInadimplenciaPercentual,
      total: null,
      icon: TrendingUp,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.15)',
      unit: '%',
    },
    {
      label: 'Frequência Média',
      value: data.kpi.frequenciaMediaPorDia,
      total: null,
      icon: Activity,
      color: 'var(--color-accent)',
      bg: 'var(--color-accent-muted)',
      unit: '/dia',
    },
    {
      label: 'Novos Alunos',
      value: data.kpi.novosAlunosEsteMes,
      total: null,
      icon: UserPlus,
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.15)',
      unit: ' este mês',
    },
    {
      label: 'Equipamentos c/ Problema',
      value: data.kpi.problemasEquipamento,
      total: data.kpi.totalEquipamentos,
      icon: Wrench,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.15)',
      unit: '',
    },
    {
      label: 'Manutenções Pendentes',
      value: data.kpi.manutencoesPendentes,
      total: null,
      icon: AlertTriangle,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.15)',
      unit: '',
    },
  ];

  const customTooltipStyle = {
    backgroundColor: '#161625',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    color: '#f0f0ff',
    fontSize: '12px',
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader
        title="Dashboard Gerencial"
        subtitle="Visão geral da academia — atualizado em tempo real"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.slice(0, 4).map(({ label, value, total, icon: Icon, color, bg, unit }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <p className="text-2xl font-black" style={{ color: 'var(--color-text-primary)' }}>
                {unit === 'currency'
                  ? formatCurrency(value)
                  : unit === '%'
                  ? `${value.toFixed(1)}%`
                  : `${value}${unit}`}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {label}{total !== null && ` / ${total} total`}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Receita vs Esperado</h2>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Últimos 5 meses (R$)</p>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.revenueData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7d14ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7d14ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEsperado" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffb300" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ffb300" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorInad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#606080" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#606080" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
              <Tooltip contentStyle={customTooltipStyle} formatter={(v) => typeof v === 'number' ? formatCurrency(v) : String(v)} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#a0a0c0' }} />
              <Area type="monotone" dataKey="receita" name="Recebido" stroke="#7d14ff" strokeWidth={2} fill="url(#colorReceita)" />
              <Area type="monotone" dataKey="esperado" name="Esperado" stroke="#ffb300" strokeWidth={2} fill="url(#colorEsperado)" />
              <Area type="monotone" dataKey="inadimplencia" name="Inadimplência" stroke="#ef4444" strokeWidth={2} fill="url(#colorInad)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {kpis.slice(4).map(({ label, value, total, icon: Icon, color, bg, unit }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <div>
                <p className="text-xl font-black" style={{ color: 'var(--color-text-primary)' }}>
                  {unit === 'currency' ? formatCurrency(value) : unit === '%' ? `${value.toFixed(1)}%` : `${value}${unit}`}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {label}{total !== null && ` / ${total} total`}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
'use client';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useAutenticacaoStore } from '@/lib/store/auth-store';
import { useStudentsByProfessor } from '@/lib/queries/use-alunos';
import { useAlertsStore } from '@/lib/store/alertas-store';
import { SkeletonList } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/shared/avatar';
import { PageHeader } from '@/components/shared/page-header';
import { getPaymentStatusBg, getPaymentStatusLabel } from '@/lib/utils';
import { Users, Dumbbell, Bell, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ProfessorDashboardPage() {
  const { user } = useAutenticacaoStore();
  const { data: alunos, isLoading: carregando } = useStudentsByProfessor(user?.id ?? '');
  
  const fetchAlerts = useAlertsStore((s) => s.fetchAlerts);
  const quantidadeNaoLida = useAlertsStore((s) => s.getUnreadCount)();

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <PageHeader
          title={`Olá, ${user?.name.split(' ')[0]} 👋`}
          subtitle="Painel do professor — Visualize seus alunos e tarefas"
        />
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Meus Alunos',
            value: alunos?.length ?? 0,
            icon: Users,
            color: 'var(--color-primary)',
            bg: 'var(--color-primary-muted)',
          },
          {
            label: 'Com Ficha Ativa',
            value: alunos?.filter((s) => s.planoTreinoAtivoId).length ?? 0,
            icon: Dumbbell,
            color: '#10b981',
            bg: 'rgba(16, 185, 129, 0.15)',
          },
          {
            label: 'Inadimplentes',
            value: alunos?.filter((s) => s.statusPagamento === 'inadimplente').length ?? 0,
            icon: Bell,
            color: '#ef4444',
            bg: 'rgba(239, 68, 68, 0.15)',
          },
          {
            label: 'Alertas Não Lidos',
            value: quantidadeNaoLida,
            icon: Bell,
            color: 'var(--color-accent)',
            bg: 'var(--color-accent-muted)',
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: bg }}
              >
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <p className="text-2xl font-black" style={{ color: 'var(--color-text-primary)' }}>
                {value}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Lista de alunos */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
            Meus Alunos
          </h2>
          <Link
            href="/professor/alunos"
            className="text-xs font-semibold flex items-center gap-1"
            style={{ color: 'var(--color-primary)' }}
          >
            Ver todos <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {carregando ? (
          <SkeletonList count={4} />
        ) : (
          <div className="space-y-2">
            {alunos?.slice(0, 5).map((student) => (
              <Link key={student.id} href={`/professor/alunos/${student.id}`}>
                <div
                  className="card-interactive flex items-center gap-3 p-4"
                >
                  <Avatar name={student.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {student.name}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                      {student.planoTreinoAtivoId ? 'Ficha ativa' : 'Sem ficha'}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ring-1 ring-inset flex-shrink-0 ${getPaymentStatusBg(student.statusPagamento)}`}
                  >
                    {getPaymentStatusLabel(student.statusPagamento)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

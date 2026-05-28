'use client';
import { motion } from 'framer-motion';
import { useAutenticacaoStore } from '@/lib/store/auth-store';
import { useAlunoPorUsuarioId } from '@/lib/queries/use-alunos';
import { usePlanoTreino } from '@/lib/queries/use-treinos';
import { useAlertsForRole } from '@/lib/queries/use-alertas';
import { SkeletonCard } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/shared/avatar';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Dumbbell,
  Flame,
  ChevronRight,
  Bell,
} from 'lucide-react';
import { formatCurrency, getPaymentStatusBg, getPaymentStatusLabel } from '@/lib/utils';
import Link from 'next/link';


export default function AlunoDashboardPage() {
  const { user } = useAutenticacaoStore();
  const { data: student, isLoading: loadingStudent } = useAlunoPorUsuarioId(user?.id ?? '');
  const { data: workoutPlan, isLoading: loadingPlan } = usePlanoTreino(
    student?.planoTreinoAtivoId
  );
  const { data: alertas, isLoading: loadingAlerts } = useAlertsForRole('aluno');

  const unreadAlerts = alertas?.filter((a) => !a.lido).length ?? 0;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      {/* Greeting */}
      <motion.div variants={item} className="flex items-center gap-3 py-2">
        {user && <Avatar name={user.name} size="md" />}
        <div>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Bom dia 👋
          </p>
          <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {user?.name.split(' ')[0]}
          </h1>
        </div>
      </motion.div>

      {/* Status pagamento */}
      {loadingStudent ? (
        <SkeletonCard />
      ) : student ? (
        <motion.div variants={item}>
          <Card glass>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                    Status da Mensalidade
                  </p>
                  <div className="flex items-center gap-2">
                    {student.statusPagamento === 'adimplente' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : student.statusPagamento === 'inadimplente' ? (
                      <AlertCircle className="h-4 w-4 text-red-400" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-400" />
                    )}
                    <span
                      className={`text-sm font-bold px-2 py-0.5 rounded-full ring-1 ring-inset ${getPaymentStatusBg(student.statusPagamento)}`}
                    >
                      {getPaymentStatusLabel(student.statusPagamento)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Mensalidade
                  </p>
                  <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {formatCurrency(student.mensalidade)}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Vence dia {student.diaVencimento}
                  </p>
                </div>
              </div>

              {student.statusPagamento === 'inadimplente' && (
                <div
                  className="mt-4 p-3 rounded-xl text-xs"
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    color: '#f87171',
                  }}
                >
                  ⚠️ Sua mensalidade está em atraso. Regularize para continuar aproveitando todos os recursos.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : null}

      {/* Ficha Ativa */}
      <motion.div variants={item}>
        <Link href="/aluno/treino">
          <div
            className="card-interactive p-5"
            style={{
              background:
                'linear-gradient(135deg, var(--color-primary) 0%, #5b0fc7 100%)',
              border: 'none',
              boxShadow: '0 4px 32px oklch(55% 0.28 290 / 0.35)',
            }}
          >
            {loadingPlan ? (
              <div className="space-y-2">
                <div className="h-3 w-24 rounded" style={{ background: 'rgba(255,255,255,0.15)' }} />
                <div className="h-4 w-40 rounded" style={{ background: 'rgba(255,255,255,0.15)' }} />
              </div>
            ) : workoutPlan ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Dumbbell className="h-4 w-4 text-white/70" />
                    <span className="text-xs font-medium text-white/70">Ficha Ativa</span>
                  </div>
                  <h2 className="text-lg font-bold text-white">{workoutPlan.name}</h2>
                  <p className="text-sm text-white/70 mt-0.5">
                    {workoutPlan.exercicios.length} exercícios • {workoutPlan.diasPorSemana}x/semana
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-white/70" />
              </div>
            ) : (
              <div>
                <p className="text-white/70 text-sm">Nenhuma ficha ativa</p>
                <p className="text-white font-semibold mt-1">Fale com seu professor para criar uma ficha</p>
              </div>
            )}
          </div>
        </Link>
      </motion.div>

      {/* Estatísticas */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--color-primary-muted)' }}
              >
                <Flame className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
              </div>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Streaks</span>
            </div>
            <p className="text-2xl font-black" style={{ color: 'var(--color-text-primary)' }}>7</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>dias seguidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(16, 185, 129, 0.15)' }}
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Este mês</span>
            </div>
            <p className="text-2xl font-black" style={{ color: 'var(--color-text-primary)' }}>18</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>treinos feitos</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alertas recentes */}
      {!loadingAlerts && unreadAlerts > 0 && (
        <motion.div variants={item}>
          <Link href="/aluno/alertas">
            <div
              className="card-base p-4 flex items-center justify-between"
              style={{ borderColor: 'var(--color-border-default)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-9 w-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255, 179, 0, 0.15)' }}
                >
                  <Bell className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {unreadAlerts} alerta{unreadAlerts > 1 ? 's' : ''} novo{unreadAlerts > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Toque para ver</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
            </div>
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}

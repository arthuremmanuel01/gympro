'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAlunos, useUpdatePaymentStatus } from '@/lib/queries/use-alunos';
import { SkeletonList } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/shared/avatar';
import { PageHeader } from '@/components/shared/page-header';
import { formatCurrency, formatDate, getPaymentStatusBg, getPaymentStatusLabel } from '@/lib/utils';
import { CheckCircle2, AlertCircle, Clock, DollarSign } from 'lucide-react';
import type { StatusPagamento } from '@/types';

export default function FinanceiroPage() {
  const { data: alunos, isLoading: carregando } = useAlunos();
  const { mutate: updateStatus, isPending } = useUpdatePaymentStatus();
  const [filter, setFilter] = useState<StatusPagamento | 'todos'>('todos');
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = filter === 'todos' ? alunos : alunos?.filter((s) => s.statusPagamento === filter);

  const fs = useMemo(() => {
    if (!alunos) return { receitaMensalBRL: 0, adimplentes: 0, inadimplentes: 0, pendentes: 0 };

    return {
      receitaMensalBRL: alunos
        .filter((a) => a.statusPagamento === 'adimplente')
        .reduce((acc, cur) => acc + cur.mensalidade, 0),
      adimplentes: alunos.filter((a) => a.statusPagamento === 'adimplente').length,
      inadimplentes: alunos.filter((a) => a.statusPagamento === 'inadimplente').length,
      pendentes: alunos.filter((a) => a.statusPagamento === 'pendente').length,
    };
  }, [alunos]);

  function handleUpdateStatus(alunoId: string, status: StatusPagamento) {
    setUpdating(alunoId);
    updateStatus({ id: alunoId, status }, { onSettled: () => setUpdating(null) });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Financeiro" subtitle="Controle de mensalidades e inadimplência" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Receita do Mês', value: formatCurrency(fs.receitaMensalBRL), icon: DollarSign, color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
          { label: 'Adimplentes', value: fs.adimplentes, icon: CheckCircle2, color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
          { label: 'Inadimplentes', value: fs.inadimplentes, icon: AlertCircle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
          { label: 'Pendentes', value: fs.pendentes, icon: Clock, color: 'var(--color-accent)', bg: 'var(--color-accent-muted)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center mb-2" style={{ background: bg }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <p className="text-xl font-black" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex gap-2">
        {(['todos', 'adimplente', 'inadimplente', 'pendente'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
            style={{
              background: filter === s ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
              color: filter === s ? 'white' : 'var(--color-text-muted)',
              border: filter === s ? '1px solid transparent' : '1px solid var(--color-border-subtle)',
            }}
          >
            {s === 'todos' ? 'Todos' : getPaymentStatusLabel(s)}
          </button>
        ))}
      </div>
      {carregando ? (
        <SkeletonList count={5} />
      ) : (
        <div className="space-y-2">
          {filtered?.map((student, i) => (
            <motion.div key={student.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={student.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{student.name}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Vence dia {student.diaVencimento} • {formatCurrency(student.mensalidade)}/mês</p>
                      {student.ultimoPagamentoEm && (
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Último pagamento: {formatDate(student.ultimoPagamentoEm)}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ring-1 ring-inset ${getPaymentStatusBg(student.statusPagamento)}`}>
                        {getPaymentStatusLabel(student.statusPagamento)}
                      </span>
                      {student.statusPagamento !== 'adimplente' && (
                        <Button size="sm" variant="ghost" carregando={updating === student.id && isPending} onClick={() => handleUpdateStatus(student.id, 'adimplente')} className="text-xs h-7 px-2">
                          Regularizar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

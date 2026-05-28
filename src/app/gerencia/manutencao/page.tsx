'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMaintenanceRequests, useUpdateMaintenanceStatus } from '@/lib/queries/use-manutencao';
import { SkeletonList } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/shared/page-header';
import { formatCurrency, formatDate, getMaintenanceStatusBg, getMaintenanceStatusLabel, getPriorityColor, getPriorityLabel } from '@/lib/utils';
import { CheckCircle2, XCircle, Clock, Wrench } from 'lucide-react';
import type { SolicitacaoManutencao, StatusManutencao } from '@/types';

export default function ManutencaoPage() {
  const { data: solicitacoes, isLoading: carregando } = useMaintenanceRequests();
  const { mutate: updateStatus, isPending } = useUpdateMaintenanceStatus();
  const [selected, setSelected] = useState<SolicitacaoManutencao | null>(null);
  const [action, setAction] = useState<'aprovada' | 'rejeitada' | null>(null);
  const [notes, setNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusManutencao | 'todos'>('todos');
  const filtered = filterStatus === 'todos' ? solicitacoes : solicitacoes?.filter((r) => r.status === filterStatus);

  function handleAction(req: SolicitacaoManutencao, act: 'aprovada' | 'rejeitada') {
    setSelected(req); setAction(act); setNotes('');
  }

  function handleConfirm() {
    if (!selected || !action) return;
    updateStatus(
      { id: selected.id, status: action, notes: notes || undefined },
      { onSuccess: () => { setSelected(null); setAction(null); setNotes(''); } }
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Manutenção" subtitle="Aprovação e acompanhamento de solicitações" />
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['todos', 'pendente', 'aprovada', 'rejeitada', 'concluida'] as const).map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
            style={{
              background: filterStatus === s ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
              color: filterStatus === s ? 'white' : 'var(--color-text-muted)',
              border: filterStatus === s ? '1px solid transparent' : '1px solid var(--color-border-subtle)',
            }}
          >
            {s === 'todos' ? 'Todos' : getMaintenanceStatusLabel(s)}
          </button>
        ))}
      </div>
      {carregando ? <SkeletonList count={4} /> : (
        <div className="space-y-3">
          {filtered?.map((req, i) => (
            <motion.div key={req.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-bg-elevated)' }}>
                      <Wrench className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{req.nomeEquipamento}</p>
                        <div className="flex gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ring-inset ${getPriorityColor(req.priority)}`}>{getPriorityLabel(req.priority)}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ring-inset ${getMaintenanceStatusBg(req.status)}`}>{getMaintenanceStatusLabel(req.status)}</span>
                        </div>
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{req.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        <span>Por: {req.nomeSolicitante}</span>
                        <span>{formatDate(req.criadoEm)}</span>
                        {req.custoEstimadoBRL && <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatCurrency(req.custoEstimadoBRL)}</span>}
                      </div>
                      {req.notes && <p className="text-xs mt-1 italic" style={{ color: 'var(--color-text-muted)' }}>{req.notes}</p>}
                      {req.status === 'pendente' && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />} onClick={() => handleAction(req, 'aprovada')}>Aprovar</Button>
                          <Button size="sm" variant="danger" leftIcon={<XCircle className="h-3.5 w-3.5" />} onClick={() => handleAction(req, 'rejeitada')}>Rejeitar</Button>
                        </div>
                      )}
                      {req.status === 'aprovada' && (
                        <Button size="sm" variant="outline" leftIcon={<Clock className="h-3.5 w-3.5" />} className="mt-3" onClick={() => updateStatus({ id: req.id, status: 'concluida' })}>Marcar como Concluída</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {filtered?.length === 0 && (
            <div className="text-center py-12">
              <Wrench className="h-8 w-8 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <p style={{ color: 'var(--color-text-muted)' }}>Nenhuma solicitação nesta categoria</p>
            </div>
          )}
        </div>
      )}
      <Modal isOpen={!!selected && !!action} onClose={() => { setSelected(null); setAction(null); }} title={action === 'aprovada' ? 'Confirmar Aprovação' : 'Confirmar Rejeição'} size="sm">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {action === 'aprovada' ? `Aprovar solicitação de manutenção para "${selected?.nomeEquipamento}"?` : `Rejeitar solicitação para "${selected?.nomeEquipamento}"?`}
          </p>
          <Textarea id="approval-notes" label="Observações (opcional)" placeholder="Adicione um comentário..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => { setSelected(null); setAction(null); }}>Cancelar</Button>
            <Button className="flex-1" variant={action === 'rejeitada' ? 'danger' : 'primary'} carregando={isPending} onClick={handleConfirm}>{action === 'aprovada' ? 'Aprovar' : 'Rejeitar'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

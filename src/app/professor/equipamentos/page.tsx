'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useEquipamentos, useUpdateEquipmentStatus } from '@/lib/queries/use-equipamentos';
import { SkeletonCard } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/shared/page-header';
import {
  getEquipmentStatusColor,
  getEquipmentStatusLabel,
} from '@/lib/utils';
import { Wrench, CheckCircle2, AlertTriangle, XCircle, Settings } from 'lucide-react';
import type { Equipamento, StatusEquipamento } from '@/types';

const statusIcons: Record<StatusEquipamento, React.ElementType> = {
  funcionando: CheckCircle2,
  manutencao: AlertTriangle,
  quebrado: XCircle,
};

export default function EquipamentosPage() {
  const { data: equipamentos, isLoading: carregando } = useEquipamentos();
  const { mutate: updateStatus, isPending } = useUpdateEquipmentStatus();
  const [selected, setSelected] = useState<Equipamento | null>(null);
  const [newStatus, setNewStatus] = useState<StatusEquipamento>('funcionando');
  const [notes, setNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusEquipamento | 'todos'>('todos');

  const filtered =
    filterStatus === 'todos'
      ? equipamentos
      : equipamentos?.filter((eq) => eq.status === filterStatus);

  const counts = {
    todos: equipamentos?.length ?? 0,
    funcionando: equipamentos?.filter((e) => e.status === 'funcionando').length ?? 0,
    manutencao: equipamentos?.filter((e) => e.status === 'manutencao').length ?? 0,
    quebrado: equipamentos?.filter((e) => e.status === 'quebrado').length ?? 0,
  };

  function handleSave() {
    if (!selected) return;
    updateStatus(
      { id: selected.id, status: newStatus, notes: notes || undefined },
      {
        onSuccess: () => {
          setSelected(null);
          setNotes('');
        },
      }
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Equipamentos"
        subtitle="Status e manutenção do maquinário"
      />

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['todos', 'funcionando', 'manutencao', 'quebrado'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors`}
            style={{
              background:
                filterStatus === s ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
              color: filterStatus === s ? 'white' : 'var(--color-text-muted)',
              border:
                filterStatus === s
                  ? '1px solid transparent'
                  : '1px solid var(--color-border-subtle)',
            }}
          >
            {s === 'todos' ? 'Todos' : getEquipmentStatusLabel(s)} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Equipamento Grid */}
      {carregando ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} lines={2} />
          ))}
        </div>
      ) : filtered?.length === 0 ? (
        <Card>
          <CardContent className="text-center py-10">
            <Wrench className="h-10 w-10 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Nenhum equipamento encontrado.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered?.map((eq, i) => {
            const StatusIcon = statusIcons[eq.status];
            return (
              <motion.div
                key={eq.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card interactive onClick={() => { setSelected(eq); setNewStatus(eq.status); setNotes(eq.notes ?? ''); }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold truncate"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {eq.name}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                          {eq.category} {eq.brand ? `• ${eq.brand}` : ''}
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                          {eq.location}
                        </p>
                        {eq.notes && (
                          <p
                            className="text-xs mt-1 italic truncate"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            {eq.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ring-inset flex items-center gap-1 ${getEquipmentStatusColor(eq.status)}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {getEquipmentStatusLabel(eq.status)}
                        </span>
                        <Settings className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Edit Status Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ''}
      >
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {selected?.category} • {selected?.location}
          </p>
          <Select
            id="equipamentos-status"
            label="Novo Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as StatusEquipamento)}
            options={[
              { value: 'funcionando', label: '✅ Funcionando' },
              { value: 'manutencao', label: '⚠️ Em Manutenção' },
              { value: 'quebrado', label: '❌ Quebrado' },
            ]}
          />
          <Textarea
            id="equipamentos-notes"
            label="Observações"
            placeholder="Descreva o problema ou status..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleSave} carregando={isPending}>
              Salvar Status
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

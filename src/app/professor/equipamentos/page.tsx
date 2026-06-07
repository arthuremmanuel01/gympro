'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Wrench, CheckCircle2, AlertTriangle, XCircle, Settings, AlertOctagon } from 'lucide-react';
import type { Equipamento, StatusEquipamento } from '@/types';

// ── Schema Zod com validação condicional de urgência ────────────────────────
const statusSchema = z
  .object({
    status: z.enum(['funcionando', 'quebrado'] as const),
    notes: z.string().optional(),
    urgencyLevel: z.enum(['baixa', 'media', 'alta'] as const).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'quebrado' && !data.urgencyLevel) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Informe o nível de urgência do conserto.',
        path: ['urgencyLevel'],
      });
    }
  });

type StatusFormData = z.infer<typeof statusSchema>;

const statusIcons: Record<StatusEquipamento, React.ElementType> = {
  funcionando: CheckCircle2,
  manutencao: AlertTriangle,
  quebrado: XCircle,
};

const urgencyOptions = [
  { value: 'baixa', label: '🟢 Baixa — pode aguardar', color: '#22c55e' },
  { value: 'media', label: '🟡 Média — resolver em breve', color: '#f59e0b' },
  { value: 'alta', label: '🔴 Alta — conserto urgente', color: '#ef4444' },
];

export default function EquipamentosPage() {
  const { data: equipamentos, isLoading: carregando } = useEquipamentos();
  const { mutate: updateStatus, isPending } = useUpdateEquipmentStatus();
  const [selected, setSelected] = useState<Equipamento | null>(null);
  const [filterStatus, setFilterStatus] = useState<StatusEquipamento | 'todos'>('todos');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<StatusFormData>({
    resolver: zodResolver(statusSchema),
    defaultValues: { status: 'funcionando', notes: '', urgencyLevel: undefined },
  });

  const currentStatus = watch('status');

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

  function handleOpenModal(eq: Equipamento) {
    if (eq.status === 'quebrado') return;
    setSelected(eq);
    reset({ status: eq.status as 'funcionando' | 'quebrado', notes: eq.notes ?? '', urgencyLevel: undefined });
  }

  function handleCloseModal() {
    setSelected(null);
    reset({ status: 'funcionando', notes: '', urgencyLevel: undefined });
  }

  function onSubmit(data: StatusFormData) {
    if (!selected) return;
    updateStatus(
      {
        id: selected.id,
        status: data.status,
        notes: data.notes || undefined,
        urgencyLevel: data.urgencyLevel,
      },
      {
        onSuccess: () => handleCloseModal(),
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
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
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
                <Card
                  interactive={eq.status !== 'quebrado'}
                  onClick={() => handleOpenModal(eq)}
                >
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
                        {eq.status !== 'quebrado' && (
                          <Settings className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal de Edição de Status — com RHF + Zod */}
      <Modal
        isOpen={!!selected}
        onClose={handleCloseModal}
        title={selected?.name ?? ''}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {selected?.category} • {selected?.location}
          </p>

          <Select
            id="equipamentos-status"
            label="Novo Status"
            {...register('status')}
            options={[
              { value: 'funcionando', label: '✅ Funcionando' },
              { value: 'quebrado', label: '❌ Quebrado' },
            ]}
          />

          {/* Campo de Urgência — aparece dinamicamente quando status = 'quebrado' */}
          <AnimatePresence>
            {currentStatus === 'quebrado' && (
              <motion.div
                key="urgency-field"
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div
                  className="p-3 rounded-xl space-y-3"
                  style={{
                    background: 'rgba(239, 68, 68, 0.06)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="h-4 w-4 text-red-400" />
                    <p className="text-xs font-bold text-red-400">
                      Nível de Urgência do Conserto *
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {urgencyOptions.map((opt) => {
                      const isSelected = watch('urgencyLevel') === opt.value;
                      return (
                        <label
                          key={opt.value}
                          className="cursor-pointer"
                        >
                          <input
                            type="radio"
                            value={opt.value}
                            {...register('urgencyLevel')}
                            className="sr-only"
                          />
                          <div
                            className="text-center text-xs font-semibold py-2 px-1 rounded-lg border transition-all"
                            style={{
                              background: isSelected ? `${opt.color}20` : 'var(--color-bg-elevated)',
                              borderColor: isSelected ? opt.color : 'var(--color-border-subtle)',
                              color: isSelected ? opt.color : 'var(--color-text-muted)',
                              transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                            }}
                          >
                            {opt.value === 'baixa' ? '🟢' : opt.value === 'media' ? '🟡' : '🔴'}
                            <br />
                            {opt.value.charAt(0).toUpperCase() + opt.value.slice(1)}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  {errors.urgencyLevel && (
                    <p className="text-xs text-red-400 font-medium">
                      {errors.urgencyLevel.message}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Textarea
            id="equipamentos-notes"
            label="Observações"
            placeholder="Descreva o problema ou status..."
            {...register('notes')}
          />

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleCloseModal}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              carregando={isPending}
            >
              Salvar Status
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

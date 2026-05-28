'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAlertas } from '@/lib/queries/use-alertas';
import { useAddAlert } from '@/lib/queries/use-alertas';
import { useAutenticacaoStore } from '@/lib/store/auth-store';
import { SkeletonList } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { PageHeader } from '@/components/shared/page-header';
import { formatRelativeTime, getAlertTypeColor, getAlertTypeIconColor } from '@/lib/utils';
import { Plus, Bell, Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { TipoAlerta, Perfil } from '@/types';

function AlertIcon({ type }: { type: TipoAlerta }) {
  const cls = `h-4 w-4 ${getAlertTypeIconColor(type)}`;
  if (type === 'info') return <Info className={cls} />;
  if (type === 'warning') return <AlertTriangle className={cls} />;
  if (type === 'danger') return <AlertCircle className={cls} />;
  return <CheckCircle2 className={cls} />;
}

export default function AlertasProfessorPage() {
  const { user } = useAutenticacaoStore();
  const { data: alertas, isLoading: carregando } = useAlertas();
  const { mutate: addAlert, isPending } = useAddAlert();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'info' as TipoAlerta,
    perfilAlvo: 'todos' as Perfil | 'todos',
  });

  function handleSubmit() {
    if (!form.title || !form.message || !user) return;
    addAlert(
      {
        title: form.title,
        message: form.message,
        type: form.type,
        perfilAlvo: form.perfilAlvo,
        autorId: user.id,
        nomeAutor: user.name,
        lido: false,
      },
      {
        onSuccess: () => {
          setShowModal(false);
          setForm({ title: '', message: '', type: 'info', perfilAlvo: 'todos' });
        },
      }
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Alertas"
        subtitle="Envie comunicações para alunos e equipe"
        action={
          <Button
            id="new-alert-btn"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setShowModal(true)}
          >
            Novo Alerta
          </Button>
        }
      />

      {carregando ? (
        <SkeletonList count={4} />
      ) : (
        <div className="space-y-3">
          {alertas?.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`p-4 rounded-xl border ${getAlertTypeColor(alert.type)}`}
            >
              <div className="flex items-start gap-3">
                <AlertIcon type={alert.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {alert.title}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    {alert.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                      {formatRelativeTime(alert.criadoEm)}
                    </span>
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{
                        background: 'var(--color-bg-elevated)',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {alert.perfilAlvo === 'todos' ? 'Todos' : alert.perfilAlvo}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {!alertas?.length && (
            <div className="text-center py-12">
              <Bell className="h-8 w-8 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <p style={{ color: 'var(--color-text-muted)' }}>Nenhum alerta enviado ainda</p>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Novo Alerta">
        <div className="space-y-4">
          <Input
            id="alert-title"
            label="Título"
            placeholder="Ex: Academia fechada no feriado"
            value={form.title}
            onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))}
          />
          <Textarea
            id="alert-message"
            label="Mensagem"
            placeholder="Descreva o comunicado..."
            value={form.message}
            onChange={(e) => setForm((v) => ({ ...v, message: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              id="alert-type"
              label="Tipo"
              value={form.type}
              onChange={(e) => setForm((v) => ({ ...v, type: e.target.value as TipoAlerta }))}
              options={[
                { value: 'info', label: 'Informação' },
                { value: 'warning', label: 'Aviso' },
                { value: 'danger', label: 'Urgente' },
                { value: 'success', label: 'Positivo' },
              ]}
            />
            <Select
              id="alert-target"
              label="Destinatário"
              value={form.perfilAlvo}
              onChange={(e) => setForm((v) => ({ ...v, perfilAlvo: e.target.value as Perfil | 'todos' }))}
              options={[
                { value: 'todos', label: 'Todos' },
                { value: 'aluno', label: 'Alunos' },
                { value: 'professor', label: 'Professores' },
              ]}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              carregando={isPending}
              disabled={!form.title || !form.message}
            >
              Enviar Alerta
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

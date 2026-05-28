'use client';
import { motion } from 'framer-motion';
import { useAlertsForRole } from '@/lib/queries/use-alertas';
import { useMarkAlertRead } from '@/lib/queries/use-alertas';
import { useAlertsStore } from '@/lib/store/alertas-store';
import { SkeletonList } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { formatRelativeTime, getAlertTypeColor, getAlertTypeIconColor } from '@/lib/utils';
import { Bell, CheckCheck, Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { TipoAlerta } from '@/types';

function AlertIcon({ type }: { type: TipoAlerta }) {
  const cls = `h-4 w-4 ${getAlertTypeIconColor(type)}`;
  if (type === 'info') return <Info className={cls} />;
  if (type === 'warning') return <AlertTriangle className={cls} />;
  if (type === 'danger') return <AlertCircle className={cls} />;
  return <CheckCircle2 className={cls} />;
}

export default function AlertasAlunoPage() {
  const { data: alertas, isLoading: carregando } = useAlertsForRole('aluno');
  const { mutate: markRead } = useMarkAlertRead();
  const marcarTodosComoLidos = useAlertsStore((s) => s.marcarTodosComoLidos);

  if (carregando) return <SkeletonList count={4} />;

  const unread = alertas?.filter((a) => !a.lido).length ?? 0;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Alertas"
        subtitle={unread > 0 ? `${unread} não lido${unread > 1 ? 's' : ''}` : 'Tudo em dia!'}
        action={
          unread > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<CheckCheck className="h-3.5 w-3.5" />}
              onClick={marcarTodosComoLidos}
            >
              Marcar todos
            </Button>
          ) : undefined
        }
      />

      {!alertas?.length ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Bell className="h-10 w-10 mb-3" style={{ color: 'var(--color-text-muted)' }} />
          <p style={{ color: 'var(--color-text-muted)' }}>Nenhum alerta no momento</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alertas.map((alert, i) => (
            <motion.button
              key={alert.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => !alert.lido && markRead(alert.id)}
              className={`w-full text-left p-4 rounded-xl border transition-opacity ${getAlertTypeColor(alert.type)} ${alert.lido ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <AlertIcon type={alert.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="text-sm font-semibold leading-tight"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {alert.title}
                    </p>
                    {!alert.lido && (
                      <div className="h-2 w-2 rounded-full bg-[var(--color-primary)] flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p
                    className="text-xs mt-1 leading-relaxed"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {alert.message}
                  </p>
                  <p className="text-[10px] mt-2" style={{ color: 'var(--color-text-muted)' }}>
                    {formatRelativeTime(alert.criadoEm)} • por {alert.nomeAutor}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

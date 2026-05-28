'use client';
import Image from 'next/image';
import { useAutenticacaoStore } from '@/lib/store/auth-store';
import { useAlertsStore } from '@/lib/store/alertas-store';
import { Avatar } from './avatar';
import { cn } from '@/lib/utils';
import { Bell, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

interface MobileHeaderProps {
  alertsHref?: string;
  title?: string;
  alwaysShow?: boolean;
}

export function MobileHeader({ alertsHref, title, alwaysShow }: MobileHeaderProps) {
  const { user, logout } = useAutenticacaoStore();
  const alertas = useAlertsStore((s) => s.alertas);
  const quantidadeNaoLida = alertas.filter((a) => !a.lido).length;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 glass border-b border-[var(--color-border-subtle)]",
        !alwaysShow && "lg:hidden"
      )}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/logo-icon.png"
            alt="GymPro"
            width={32}
            height={32}
            className="object-contain drop-shadow-[0_0_8px_rgba(255,179,0,0.4)]"
          />
          <span className="font-bold text-sm text-[var(--color-text-primary)]">
            {title ?? 'GymPro'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {alertsHref && (
            <Link
              href={alertsHref}
              aria-label={`Alertas (${quantidadeNaoLida} não lidos)`}
              className="relative h-9 w-9 flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-white/6 transition-colors"
            >
              <Bell className="h-5 w-5" />
              {quantidadeNaoLida > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[var(--color-bg-base)]" />
              )}
            </Link>
          )}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu do usuário"
              className="h-9 w-9 flex items-center justify-center rounded-lg"
            >
              {user && <Avatar name={user.name} src={user.avatarUrl} size="xs" />}
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-11 glass-elevated rounded-xl shadow-2xl p-2 w-48 border border-[var(--color-border-default)]"
              >
                <div className="px-3 py-2 border-b border-[var(--color-border-subtle)] mb-1">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => { logout(); toast.info('Você saiu da conta'); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sair da conta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

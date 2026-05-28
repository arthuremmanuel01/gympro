'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAutenticacaoStore } from '@/lib/store/auth-store';
import { Avatar } from './avatar';
import { LogOut } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';

interface SidebarItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: SidebarItem[];
}

export function Sidebar({ items }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAutenticacaoStore();

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen glass border-r border-[var(--color-border-subtle)] sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--color-border-subtle)]">
        <Image
          src="/logo-wordmark.png"
          alt="GymPro"
          width={160}
          height={48}
          priority
          className="object-contain drop-shadow-[0_0_12px_rgba(255,179,0,0.25)]"
        />
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Menu lateral">
        {items.map((item) => {
          const Icon = item.icon;
          const ativo = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={ativo ? 'page' : undefined}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors',
                ativo
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-white/4'
              )}
            >
              {ativo && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'var(--color-primary-muted)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <Icon className="relative h-5 w-5 flex-shrink-0" strokeWidth={ativo ? 2.5 : 2} />
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Usuario Footer */}
      {user && (
        <div className="px-3 py-4 border-t border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar name={user.name} src={user.avatarUrl} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{user.name}</p>
              <p className="text-xs text-[var(--color-text-muted)] truncate">{user.email}</p>
            </div>
            <button
              onClick={() => { logout(); toast.info('Você saiu da conta'); }}
              aria-label="Sair da conta"
              className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

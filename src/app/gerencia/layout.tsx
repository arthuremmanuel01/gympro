'use client';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { Sidebar } from '@/components/shared/sidebar';
import { MobileHeader } from '@/components/shared/mobile-header';
import { BottomNav } from '@/components/shared/bottom-nav';
import { LayoutDashboard, DollarSign, Wrench } from 'lucide-react';

const navItems = [
  { href: '/gerencia/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/gerencia/financeiro', label: 'Financeiro', icon: DollarSign },
  { href: '/gerencia/manutencao', label: 'Manutenção', icon: Wrench },
];

export default function GerenciaLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthGuard(['gerencia']);
  if (!user) return null;

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-bg-base)' }}>
      <Sidebar items={navItems} />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader />
        <main className="flex-1 pb-28 lg:pb-8 px-4 lg:px-8 pt-4 lg:pt-8 w-full max-w-6xl mx-auto">
          {children}
        </main>
        <div className="lg:hidden">
          <BottomNav items={navItems} />
        </div>
      </div>
    </div>
  );
}

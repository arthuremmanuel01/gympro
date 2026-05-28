'use client';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { BottomNav } from '@/components/shared/bottom-nav';
import { MobileHeader } from '@/components/shared/mobile-header';
import { LayoutDashboard, Dumbbell, Bell } from 'lucide-react';

const navItems = [
  { href: '/aluno/dashboard', label: 'Início', icon: LayoutDashboard },
  { href: '/aluno/treino', label: 'Treino', icon: Dumbbell },
  { href: '/aluno/alertas', label: 'Alertas', icon: Bell },
];

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthGuard(['aluno']);
  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-base)' }}>
      <MobileHeader alertsHref="/aluno/alertas" alwaysShow={true} />
      <main className="pb-28 px-4 pt-4 max-w-lg mx-auto">{children}</main>
      <BottomNav items={navItems} />
    </div>
  );
}

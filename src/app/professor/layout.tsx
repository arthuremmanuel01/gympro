'use client';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { BottomNav } from '@/components/shared/bottom-nav';
import { MobileHeader } from '@/components/shared/mobile-header';
import { Sidebar } from '@/components/shared/sidebar';
import { LayoutDashboard, Users, Wrench, Bell } from 'lucide-react';

const navItems = [
  { href: '/professor/dashboard', label: 'Início', icon: LayoutDashboard },
  { href: '/professor/alunos', label: 'Alunos', icon: Users },
  { href: '/professor/equipamentos', label: 'Equipamentos', icon: Wrench },
  { href: '/professor/alertas', label: 'Alertas', icon: Bell },
];

export default function ProfessorLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthGuard(['professor']);
  if (!user) return null;

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-bg-base)' }}>
      <Sidebar items={navItems} />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader alertsHref="/professor/alertas" />
        <main className="flex-1 pb-28 lg:pb-8 px-4 lg:pt-8 pt-4 max-w-4xl w-full mx-auto">
          {children}
        </main>
        <div className="lg:hidden">
          <BottomNav items={navItems} />
        </div>
      </div>
    </div>
  );
}

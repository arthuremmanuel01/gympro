'use client';
import Image from 'next/image';
import { type ElementType } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAutenticacaoStore } from '@/lib/store/auth-store';
import { useEffect } from 'react';
import type { Perfil } from '@/types';
import { Dumbbell, GraduationCap, BarChart3, ChevronRight, Zap } from 'lucide-react';

const roles: Array<{
  role: Perfil;
  label: string;
  description: string;
  icon: ElementType;
  gradient: string;
  glow: string;
}> = [
  {
    role: 'aluno',
    label: 'Sou Aluno',
    description: 'Acesse sua ficha de treino, veja seus exercícios e acompanhe seu progresso.',
    icon: Dumbbell,
    gradient: 'from-violet-600 via-purple-700 to-purple-900',
    glow: 'rgba(125, 20, 255, 0.5)',
  },
  {
    role: 'professor',
    label: 'Sou Professor',
    description: 'Gerencie fichas de treino, equipamentos e envie alertas para os alunos.',
    icon: GraduationCap,
    gradient: 'from-blue-600 via-indigo-700 to-indigo-900',
    glow: 'rgba(99, 102, 241, 0.5)',
  },
  {
    role: 'gerencia',
    label: 'Gerência',
    description: 'Painel completo com KPIs, financeiro, manutenção de equipamentos e relatórios.',
    icon: BarChart3,
    gradient: 'from-amber-500 via-orange-600 to-orange-900',
    glow: 'rgba(255, 179, 0, 0.5)',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 28 } },
};

export default function RolePickerPage() {
  const router = useRouter();
  const { estaAutenticado, user } = useAutenticacaoStore();

  useEffect(() => {
    const temCookieSessao = typeof document !== 'undefined' && document.cookie.includes('gympro-auth-role');

    if (estaAutenticado && user && temCookieSessao) {
      const dashMap: Record<Perfil, string> = {
        aluno: '/aluno/dashboard',
        professor: '/professor/dashboard',
        gerencia: '/gerencia/dashboard',
      };
      router.replace(dashMap[user.role]);
    }
  }, [estaAutenticado, user, router]);

  function handleRoleSelect(role: Perfil) {
    router.push(`/auth/login?role=${role}`);
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: 'var(--color-bg-base)' }}
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, oklch(55% 0.28 290 / 0.18) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-[400px] h-[300px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 100% 100%, oklch(80% 0.18 80 / 0.1) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12 z-10"
      >
        {/* Logo */}
        <div className="inline-flex items-center justify-center mb-6">
          <Image
            src="/logo-full.png"
            alt="GymPro"
            width={220}
            height={220}
            priority
            className="drop-shadow-[0_0_40px_rgba(255,179,0,0.35)]"
          />
        </div>

        <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
          Gestão inteligente para academias
        </p>

        <div
          className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: 'var(--color-accent-muted)',
            color: 'var(--color-accent)',
            border: '1px solid oklch(80% 0.18 80 / 0.3)',
          }}
        >
          <Zap className="h-3.5 w-3.5" />
          Selecione seu perfil para continuar
        </div>
      </motion.div>

      {/* Perfil Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-4 z-10"
      >
        {roles.map(({ role, label, description, icon: Icon, gradient, glow }) => (
          <motion.button
            key={role}
            id={`role-btn-${role}`}
            variants={item}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect(role)}
            className="group relative flex flex-col items-start gap-4 p-6 rounded-2xl text-left overflow-hidden cursor-pointer"
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-default)',
              boxShadow: `0 0 0 0 ${glow}`,
              transition: 'box-shadow 0.3s, border-color 0.3s',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.boxShadow = `0 0 30px ${glow}, 0 8px 40px rgba(0,0,0,0.4)`;
              el.style.borderColor = 'var(--color-border-strong)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.boxShadow = `0 0 0 0 ${glow}`;
              el.style.borderColor = 'var(--color-border-default)';
            }}
            aria-label={`Entrar como ${label}`}
          >
            {/* Icon */}
            <div
              className={`h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient}`}
              style={{ boxShadow: `0 4px 16px ${glow}` }}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>

            <div>
              <h2
                className="text-lg font-bold mb-1"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {label}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                {description}
              </p>
            </div>

            <div
              className="flex items-center gap-1 text-xs font-semibold mt-auto"
              style={{ color: 'var(--color-primary)' }}
            >
              Acessar <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </motion.button>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-10 text-xs z-10"
        style={{ color: 'var(--color-text-muted)' }}
      >
        GymPro &copy; {new Date().getFullYear()} — Todos os direitos reservados
      </motion.p>
    </main>
  );
}

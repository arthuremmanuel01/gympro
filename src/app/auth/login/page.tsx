'use client';
import Image from 'next/image';
import { Suspense, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAutenticacaoStore } from '@/lib/store/auth-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Perfil } from '@/types';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido').min(1, 'E-mail é obrigatório'),
  password: z.string().min(4, 'Senha deve ter no mínimo 4 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const roleConfig: Record<Perfil, { label: string; color: string }> = {
  aluno: {
    label: 'Aluno',
    color: 'var(--color-primary)',
  },
  professor: {
    label: 'Professor',
    color: '#6366f1',
  },
  gerencia: {
    label: 'Gerência',
    color: 'var(--color-accent)',
  },
};


function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = (searchParams.get('role') ?? 'aluno') as Perfil;
  const role = roleParam in roleConfig ? roleParam : 'aluno';
  const config = roleConfig[role];

  const { login, carregando, estaAutenticado, user } = useAutenticacaoStore();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

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

  async function onSubmit(data: LoginFormData) {
    setAuthError(null);
    const result = await login(data.email, data.password);
    if (!result.success) {
      setAuthError(result.error ?? 'Erro desconhecido');
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: 'var(--color-bg-base)' }}
    >
      {/* Background glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${config.color}28 0%, transparent 70%)`,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm z-10"
      >
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm mb-8 hover:opacity-80 transition-opacity"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Trocar perfil
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <Image
              src="/logo-icon.png"
              alt="GymPro"
              width={52}
              height={52}
              className="object-contain drop-shadow-[0_0_16px_rgba(255,179,0,0.45)]"
            />
          </div>
          <h1
            className="text-2xl font-black"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Bem-vindo(a) de volta
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Acessando como{' '}
            <span className="font-semibold" style={{ color: config.color }}>
              {config.label}
            </span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            id="login-email"
            label="E-mail"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="seu@email.com"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            id="login-password"
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="h-6 w-6 flex items-center justify-center"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
            error={errors.password?.message}
            {...register('password')}
          />

          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-3 text-sm"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#f87171',
              }}
              role="alert"
            >
              {authError}
            </motion.div>
          )}

          <Button
            id="login-submit"
            type="submit"
            size="lg"
            carregando={carregando}
            className="w-full mt-2"
          >
            Entrar
          </Button>
          
          <div className="mt-6 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Ainda não tem conta?{' '}
            <Link
              href={`/auth/register?role=${role}`}
              className="font-medium hover:underline transition-all"
              style={{ color: config.color }}
            >
              Cadastre-se como {config.label}
            </Link>
          </div>
        </form>
      </motion.div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main
          className="min-h-screen flex items-center justify-center"
          style={{ background: 'var(--color-bg-base)' }}
        >
          <div className="h-8 w-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

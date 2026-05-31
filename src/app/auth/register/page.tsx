'use client';
import { Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';
import type { Perfil } from '@/types';

const registerSchema = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido').min(1, 'E-mail é obrigatório'),
  password: z.string().min(4, 'A senha deve ter no mínimo 4 caracteres'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const roleConfig: Record<Perfil, { label: string; color: string }> = {
  aluno: { label: 'Aluno', color: 'var(--color-primary)' },
  professor: { label: 'Professor', color: '#6366f1' },
  gerencia: { label: 'Gerência', color: 'var(--color-accent)' },
};

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = (searchParams.get('role') ?? 'aluno') as Perfil;
  const role = roleParam in roleConfig ? roleParam : 'aluno';
  const config = roleConfig[role];

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    setAuthError(null);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, role }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setAuthError(result.error || 'Erro ao criar conta.');
        setIsLoading(false);
        return;
      }

      router.push(`/auth/login?role=${role}`);
    } catch (err) {
      setAuthError('Falha na comunicação com o servidor.');
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden" style={{ background: 'var(--color-bg-base)' }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${config.color}28 0%, transparent 70%)` }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm z-10">
        <Link href={`/auth/login?role=${role}`} className="inline-flex items-center gap-1.5 text-sm mb-8 hover:opacity-80 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>
          <ArrowLeft className="h-4 w-4" /> Voltar para login
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-black" style={{ color: 'var(--color-text-primary)' }}>Criar nova conta</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Cadastrando-se como <span className="font-semibold" style={{ color: config.color }}>{config.label}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input id="register-name" label="Nome completo" type="text" placeholder="Seu nome completo" leftIcon={<User className="h-4 w-4" />} error={errors.name?.message} {...register('name')} />
          <Input id="register-email" label="E-mail" type="email" inputMode="email" placeholder="seu@email.com" leftIcon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register('email')} />
          <Input id="register-password" label="Senha" type={showPassword ? 'text' : 'password'} placeholder="••••••" leftIcon={<Lock className="h-4 w-4" />} rightIcon={
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="h-6 w-6 flex items-center justify-center">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            } error={errors.password?.message} {...register('password')} />

          {authError && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }} role="alert">
              {authError}
            </motion.div>
          )}

          <Button id="register-submit" type="submit" size="lg" carregando={isLoading} className="w-full mt-2">Cadastrar</Button>
        </form>
      </motion.div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-base)' }}><div className="h-8 w-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" /></main>}>
      <RegisterForm />
    </Suspense>
  );
}
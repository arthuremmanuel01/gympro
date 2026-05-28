'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAutenticacaoStore } from '@/lib/store/auth-store';
import type { Perfil } from '@/types';

export function useAuthGuard(allowedRoles: Perfil[]) {
  const { user, estaAutenticado } = useAutenticacaoStore();
  const router = useRouter();
  // Stringify to avoid array reference equality causing infinite loops
  const rolesKey = allowedRoles.join(',');

  useEffect(() => {
    if (!estaAutenticado || !user) {
      router.replace('/auth/login');
      return;
    }
    if (!rolesKey.includes(user.role)) {
      const dashMap: Record<Perfil, string> = {
        aluno: '/aluno/dashboard',
        professor: '/professor/dashboard',
        gerencia: '/gerencia/dashboard',
      };
      router.replace(dashMap[user.role]);
    }
  }, [estaAutenticado, user, rolesKey, router]);

  return { user, estaAutenticado };
}

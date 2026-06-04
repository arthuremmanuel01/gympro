'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStudentsStore } from '@/lib/store/alunos-store';
import type { Aluno, StatusPagamento } from '@/types';

export function useAlunos() {
  return useQuery({
    queryKey: ['alunos'],
    queryFn: async () => {
      const resposta = await fetch('/api/alunos');
      if (!resposta.ok) throw new Error('Falha ao buscar alunos do servidor.');
      return resposta.json() as Promise<Aluno[]>;
    },
    staleTime: 30_000,
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: ['alunos', id],
    queryFn: async () => {
      const resposta = await fetch(`/api/alunos?id=${encodeURIComponent(id)}`);
      if (!resposta.ok) {
        throw new Error('Falha ao buscar os detalhes do aluno no servidor.');
  }
      return resposta.json() as Promise<Aluno | null>;
    },
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useAlunoPorUsuarioId(usuarioId: string) {
  return useQuery({
    queryKey: ['alunos', 'by-user', usuarioId],
    queryFn: async () => {
      const resposta = await fetch(`/api/alunos?usuarioId=${encodeURIComponent(usuarioId)}`);
      if (!resposta.ok) {
        throw new Error('Falha ao buscar o aluno por ID de usuário no servidor.');
      }
      return resposta.json() as Promise<Aluno | null>;
    },
    enabled: Boolean(usuarioId),
    staleTime: 30_000,
  });
}

export function useStudentsByProfessor(professorId: string) {
  return useQuery({
    queryKey: ['alunos', 'by-professor', professorId],
    queryFn: async () => {
      const resposta = await fetch(`/api/alunos?professorId=${professorId}`);
      if (!resposta.ok) throw new Error('Falha ao buscar os alunos do servidor.');
      return resposta.json() as Promise<Aluno[]>;
    },
    enabled: Boolean(professorId),
    staleTime: 30_000,
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  const updatePaymentStatus = useStudentsStore((s) => s.updatePaymentStatus);

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: StatusPagamento }) => {
      const resposta = await fetch('/api/alunos', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });

      if (!resposta.ok) {
        throw new Error('Falha ao atualizar o status de pagamento no servidor.');
      }

      updatePaymentStatus(id, status);
      
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
    },
  });
}

export function useAddStudent() {
  const queryClient = useQueryClient();
  const addStudent = useStudentsStore((s) => s.addStudent);
  return useMutation({
    mutationFn: async (student: Aluno) => {
      await new Promise((r) => setTimeout(r, 600));
      addStudent(student);
      return student;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
    },
  });
}

'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStudentsStore } from '@/lib/store/alunos-store';
import type { Aluno, StatusPagamento } from '@/types';

export function useAlunos() {
  const alunos = useStudentsStore((s) => s.alunos);
  return useQuery({
    queryKey: ['alunos', alunos.length],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300));
      return alunos;
    },
    staleTime: Infinity,
  });
}

export function useStudent(id: string) {
  const alunos = useStudentsStore((s) => s.alunos);
  const student = alunos.find((s) => s.id === id) ?? null;
  return useQuery({
    queryKey: ['alunos', id, student?.statusPagamento],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      return student;
    },
    enabled: Boolean(id),
    staleTime: Infinity,
  });
}

export function useAlunoPorUsuarioId(usuarioId: string) {
  const alunos = useStudentsStore((s) => s.alunos);
  const student = alunos.find((s) => s.usuarioId === usuarioId) ?? null;
  return useQuery({
    queryKey: ['alunos', 'by-user', usuarioId, student?.statusPagamento],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      return student;
    },
    enabled: Boolean(usuarioId),
    staleTime: Infinity,
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
      await new Promise((r) => setTimeout(r, 500));
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

import { create } from 'zustand';
import type { Aluno, StatusPagamento } from '@/types';
import { MOCK_STUDENTS } from '@/lib/mock-data';

interface StudentsStore {
  alunos: Aluno[];
  updatePaymentStatus: (id: string, status: StatusPagamento) => void;
  updateStudent: (student: Aluno) => void;
  addStudent: (student: Aluno) => void;
  getById: (id: string) => Aluno | undefined;
  getByUserId: (usuarioId: string) => Aluno | undefined;
  getByProfessor: (professorId: string) => Aluno[];
}

export const useStudentsStore = create<StudentsStore>((set, get) => ({
  alunos: MOCK_STUDENTS,

  updatePaymentStatus: (id, status) =>
    set((state) => ({
      alunos: state.alunos.map((s) => (s.id === id ? { ...s, statusPagamento: status } : s)),
    })),

  updateStudent: (student) =>
    set((state) => ({
      alunos: state.alunos.map((s) => (s.id === student.id ? student : s)),
    })),

  addStudent: (student) =>
    set((state) => ({ alunos: [...state.alunos, student] })),

  getById: (id) => get().alunos.find((s) => s.id === id),

  getByUserId: (usuarioId) => get().alunos.find((s) => s.usuarioId === usuarioId),

  getByProfessor: (professorId) =>
    get().alunos.filter((s) => s.professorId === professorId),
}));

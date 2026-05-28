'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAutenticacaoStore } from '@/lib/store/auth-store';
import { useStudentsByProfessor } from '@/lib/queries/use-alunos';
import { SkeletonList } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/shared/avatar';
import { getPaymentStatusBg, getPaymentStatusLabel } from '@/lib/utils';
import { Search, ChevronRight, Dumbbell } from 'lucide-react';
import Link from 'next/link';

export default function AlunosProfessorPage() {
  const { user } = useAutenticacaoStore();
  const { data: alunos, isLoading: carregando } = useStudentsByProfessor(user?.id ?? '');
  const [search, setSearch] = useState('');

  const filtered = alunos?.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Meus Alunos"
        subtitle={`${alunos?.length ?? 0} alunos cadastrados`}
      />

      <Input
        id="search-alunos"
        placeholder="Buscar por nome ou e-mail..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
      />

      {carregando ? (
        <SkeletonList count={5} />
      ) : (
        <div className="space-y-2">
          {filtered?.map((student, i) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link href={`/professor/alunos/${student.id}`}>
                <div className="card-interactive flex items-center gap-3 p-4">
                  <Avatar name={student.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {student.name}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                      {student.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {student.planoTreinoAtivoId ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                          <Dumbbell className="h-3 w-3" /> Ficha ativa
                        </span>
                      ) : (
                        <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                          Sem ficha
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ring-1 ring-inset ${getPaymentStatusBg(student.statusPagamento)}`}
                    >
                      {getPaymentStatusLabel(student.statusPagamento)}
                    </span>
                    <ChevronRight className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
          {filtered?.length === 0 && (
            <div className="text-center py-12">
              <p style={{ color: 'var(--color-text-muted)' }}>Nenhum aluno encontrado</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

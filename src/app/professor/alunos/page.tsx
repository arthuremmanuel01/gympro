'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAutenticacaoStore } from '@/lib/store/auth-store';
import { useStudentsByProfessor } from '@/lib/queries/use-alunos';
import { SkeletonList } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/shared/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getPaymentStatusBg, getPaymentStatusLabel } from '@/lib/utils';
import { Search, ChevronRight, Dumbbell, UserPlus, UserMinus, ShieldAlert } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import type { Aluno } from '@/types';

export default function AlunosProfessorPage() {
  const { user } = useAutenticacaoStore();
  const queryClient = useQueryClient();
  const { data: alunos, isLoading: carregando } = useStudentsByProfessor(user?.id ?? '');
  const [search, setSearch] = useState('');
  
  const [cpfSearch, setCpfSearch] = useState('');
  const [searchResult, setSearchResult] = useState<Aluno | null>(null);
  const [buscandoCpf, setBuscandoCpf] = useState(false);
  const [cpfFeedback, setCpfFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const filtered = alunos?.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSearchCpf(e: React.FormEvent) {
    e.preventDefault();
    if (!cpfSearch.trim()) return;
    setBuscandoCpf(true);
    setCpfFeedback(null);
    setSearchResult(null);

    try {
      const res = await fetch(`/api/alunos?cpf=${encodeURIComponent(cpfSearch.replace(/\D/g, ''))}`);
      if (!res.ok) throw new Error();
      const aluno: Aluno | null = await res.json();
      
      if (!aluno) {
        setCpfFeedback({ type: 'error', message: 'Nenhum aluno localizado com este CPF.' });
      } else {
        setSearchResult(aluno);
      }
    } catch (err) {
      setCpfFeedback({ type: 'error', message: 'Erro ao buscar aluno por CPF.' });
    } finally {
      setBuscandoCpf(false);
    }
  }

  async function handleEnviarSolicitacao(alunoId: string) {
    if (!user) return;
    try {
      const res = await fetch('/api/alunos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: alunoId,
          action: 'solicitar',
          professorId: user.id,
          professorName: user.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar solicitação.');
      
      setCpfFeedback({ type: 'success', message: 'Solicitação de vínculo enviada com sucesso!' });
      setSearchResult(null);
      setCpfSearch('');
    } catch (err: any) {
      setCpfFeedback({ type: 'error', message: err.message || 'Falha na operação.' });
    }
  }

  async function handleRemoverVinculo(e: React.MouseEvent, alunoId: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Deseja realmente remover o vínculo com este aluno?')) return;

    try {
      const res = await fetch('/api/alunos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alunoId, action: 'remover' }),
      });
      if (!res.ok) throw new Error();
      queryClient.invalidateQueries({ queryKey: ['alunos', 'by-professor', user?.id] });
    } catch (err) {
      alert('Erro ao remover vínculo com o aluno.');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meus Alunos"
        subtitle={`${alunos?.length ?? 0} alunos vinculados`}
      />

      {/* Seção Vincular Aluno por CPF */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <UserPlus className="h-4 w-4" /> Vincular Novo Aluno
          </h3>
          <form onSubmit={handleSearchCpf} className="flex gap-2">
            <Input
              id="cpf-search"
              placeholder="Digite o CPF do aluno..."
              value={cpfSearch}
              onChange={(e) => setCpfSearch(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={buscandoCpf}>
              {buscandoCpf ? 'Buscando...' : 'Buscar'}
            </Button>
          </form>

          {cpfFeedback && (
            <p className={`text-xs font-semibold ${cpfFeedback.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {cpfFeedback.message}
            </p>
          )}

          {searchResult && (
            <div className="p-3 rounded-xl flex items-center justify-between gap-3" style={{ background: 'var(--color-bg-elevated)' }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{searchResult.name}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{searchResult.email}</p>
              </div>
              {searchResult.professorId && searchResult.professorId !== '' ? (
                <span className="text-xs flex items-center gap-1 text-amber-400 font-medium">
                  <ShieldAlert className="h-3.5 w-3.5" /> Já possui professor
                </span>
              ) : searchResult.solicitacaoProfessorId ? (
                <span className="text-xs text-amber-500 font-medium">Aguardando outra resposta</span>
              ) : (
                <Button size="sm" onClick={() => handleEnviarSolicitacao(searchResult.id)}>
                  Enviar Vínculo
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Alunos Ativos */}
      <div className="space-y-4">
        <Input
          id="search-alunos"
          placeholder="Buscar por nome ou e-mail na minha lista..."
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
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ring-1 ring-inset ${getPaymentStatusBg(student.statusPagamento)}`}
                        >
                          {getPaymentStatusLabel(student.statusPagamento)}
                        </span>
                        <button
                          onClick={(e) => handleRemoverVinculo(e, student.id)}
                          className="p-1 rounded-lg hover:bg-rose-500/10 text-rose-400 transition-colors"
                          title="Remover aluno vinculado"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      </div>
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
    </div>
  );
}
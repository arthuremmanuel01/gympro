'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutenticacaoStore } from '@/lib/store/auth-store';
import { useStudentsByProfessor } from '@/lib/queries/use-alunos';
import { useSolicitacoesFicha, useAlunosAtendidosPorProfessor } from '@/lib/queries/use-solicitacoes-ficha';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SkeletonList } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/shared/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getPaymentStatusBg, getPaymentStatusLabel } from '@/lib/utils';
import {
  Search,
  ChevronRight,
  Dumbbell,
  UserPlus,
  UserMinus,
  ShieldAlert,
  ClipboardList,
  History,
  Users,
  Clock,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import type { Aluno } from '@/types';

// ── Schema Zod para busca por CPF ──────────────────────────────────────────
const cpfSchema = z.object({
  cpf: z
    .string()
    .min(1, 'Informe o CPF.')
    .transform((v) => v.replace(/\D/g, ''))
    .pipe(z.string().length(11, 'CPF deve ter 11 dígitos.')),
});
type CpfFormData = z.infer<typeof cpfSchema>;

type Tab = 'meus-alunos' | 'solicitacoes' | 'historico';

const TAB_CONFIG: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'meus-alunos', label: 'Meus Alunos', icon: Users },
  { key: 'solicitacoes', label: 'Solicitações', icon: ClipboardList },
  { key: 'historico', label: 'Histórico', icon: History },
];

export default function AlunosProfessorPage() {
  const { user } = useAutenticacaoStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('meus-alunos');
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState<Aluno | null>(null);
  const [buscandoCpf, setBuscandoCpf] = useState(false);

  // Data hooks
  const { data: meusAlunos, isLoading: carregandoAlunos } = useStudentsByProfessor(user?.id ?? '');
  const { data: solicitacoes, isLoading: carregandoSolicitacoes } = useSolicitacoesFicha();
  const { data: historico, isLoading: carregandoHistorico } = useAlunosAtendidosPorProfessor(user?.id ?? '');

  // React Hook Form para busca por CPF
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetCpf,
  } = useForm<CpfFormData>({
    resolver: zodResolver(cpfSchema),
  });

  const filteredAlunos = meusAlunos?.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  async function onSearchCpf(data: CpfFormData) {
    setBuscandoCpf(true);
    setSearchResult(null);
    try {
      const res = await fetch(`/api/alunos?cpf=${encodeURIComponent(data.cpf)}`);
      if (!res.ok) throw new Error();
      const aluno: Aluno | null = await res.json();
      if (!aluno) {
        toast.error('Nenhum aluno localizado com este CPF.');
      } else {
        setSearchResult(aluno);
      }
    } catch {
      toast.error('Erro ao buscar aluno por CPF.');
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
      toast.success('Solicitação de vínculo enviada com sucesso!');
      setSearchResult(null);
      resetCpf();
    } catch (err: any) {
      toast.error(err.message || 'Falha na operação.');
    }
  }

  async function handleRemoverVinculo(e: React.MouseEvent, alunoId: string) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch('/api/alunos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alunoId, action: 'remover' }),
      });
      if (!res.ok) throw new Error();
      queryClient.invalidateQueries({ queryKey: ['alunos', 'by-professor', user?.id] });
      toast.success('Vínculo removido com sucesso.');
    } catch {
      toast.error('Erro ao remover vínculo com o aluno.');
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Alunos"
        subtitle="Gerencie sua carteira de alunos"
      />

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl"
        style={{ background: 'var(--color-bg-elevated)' }}
      >
        {TAB_CONFIG.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key;
          const badge =
            key === 'solicitacoes' && (solicitacoes?.length ?? 0) > 0
              ? solicitacoes!.length
              : null;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all relative"
              style={{
                background: isActive ? 'var(--color-bg-surface)' : 'transparent',
                color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {badge && (
                <span
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full text-[10px] font-black flex items-center justify-center"
                  style={{ background: '#ef4444', color: 'white' }}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* ── ABA: MEUS ALUNOS ────────────────────────────────────── */}
        {activeTab === 'meus-alunos' && (
          <motion.div
            key="meus-alunos"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {/* Vincular por CPF */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                  <UserPlus className="h-4 w-4" /> Vincular Novo Aluno por CPF
                </h3>
                <form onSubmit={handleSubmit(onSearchCpf)} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      id="cpf-search"
                      placeholder="000.000.000-00"
                      {...register('cpf')}
                      className="flex-1"
                    />
                    {errors.cpf && (
                      <p className="text-xs text-rose-400 mt-1">{errors.cpf.message}</p>
                    )}
                  </div>
                  <Button type="submit" disabled={buscandoCpf} carregando={buscandoCpf}>
                    Buscar
                  </Button>
                </form>

                {searchResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl flex items-center justify-between gap-3"
                    style={{ background: 'var(--color-bg-elevated)' }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={searchResult.name} size="sm" />
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{searchResult.name}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{searchResult.email}</p>
                      </div>
                    </div>
                    {searchResult.professorId && searchResult.professorId !== '' ? (
                      <span className="text-xs flex items-center gap-1 text-amber-400 font-medium flex-shrink-0">
                        <ShieldAlert className="h-3.5 w-3.5" /> Já possui professor
                      </span>
                    ) : searchResult.solicitacaoProfessorId ? (
                      <span className="text-xs text-amber-500 font-medium flex-shrink-0">Aguardando outra resposta</span>
                    ) : (
                      <Button size="sm" onClick={() => handleEnviarSolicitacao(searchResult.id)}>
                        Enviar Vínculo
                      </Button>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Busca na lista */}
            <Input
              id="search-alunos"
              placeholder="Buscar por nome ou e-mail na minha lista..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />

            {carregandoAlunos ? (
              <SkeletonList count={5} />
            ) : (
              <div className="space-y-2">
                {filteredAlunos?.map((student, i) => (
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
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
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
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ring-1 ring-inset ${getPaymentStatusBg(student.statusPagamento)}`}>
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
                {filteredAlunos?.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-8 w-8 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
                    <p style={{ color: 'var(--color-text-muted)' }}>Nenhum aluno encontrado</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── ABA: SOLICITAÇÕES DE FICHA ──────────────────────────── */}
        {activeTab === 'solicitacoes' && (
          <motion.div
            key="solicitacoes"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.15 }}
            className="space-y-3"
          >
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Alunos de toda a academia que solicitaram criação ou atualização de ficha.
            </p>

            {carregandoSolicitacoes ? (
              <SkeletonList count={3} />
            ) : solicitacoes?.length === 0 ? (
              <Card>
                <CardContent className="text-center py-10">
                  <ClipboardList className="h-8 w-8 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Nenhuma solicitação pendente no momento.
                  </p>
                </CardContent>
              </Card>
            ) : (
              solicitacoes?.map((aluno, i) => (
                <motion.div
                  key={aluno.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/professor/alunos/${aluno.id}`}>
                    <div
                      className="card-interactive flex items-center gap-3 p-4"
                      style={{
                        borderLeft: `3px solid ${aluno.tipoSolicitacaoFicha === 'nova' ? 'var(--color-primary)' : '#10b981'}`,
                      }}
                    >
                      <Avatar name={aluno.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                          {aluno.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {aluno.tipoSolicitacaoFicha === 'nova' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
                              ✨ Nova Ficha
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                              <RefreshCw className="h-2.5 w-2.5 inline mr-0.5" />Atualização
                            </span>
                          )}
                          <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                            <Clock className="h-2.5 w-2.5 inline mr-0.5" />
                            {aluno.solicitacaoFichaEm
                              ? new Date(aluno.solicitacaoFichaEm as string).toLocaleDateString('pt-BR')
                              : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ring-1 ring-inset ${getPaymentStatusBg(aluno.statusPagamento)}`}>
                          {getPaymentStatusLabel(aluno.statusPagamento)}
                        </span>
                        <ArrowRight className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* ── ABA: HISTÓRICO ──────────────────────────────────────── */}
        {activeTab === 'historico' && (
          <motion.div
            key="historico"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.15 }}
            className="space-y-3"
          >
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Alunos cujas fichas de treino você já criou ou modificou.
            </p>

            {carregandoHistorico ? (
              <SkeletonList count={3} />
            ) : historico?.length === 0 ? (
              <Card>
                <CardContent className="text-center py-10">
                  <History className="h-8 w-8 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Você ainda não criou fichas para nenhum aluno.
                  </p>
                </CardContent>
              </Card>
            ) : (
              historico?.map((aluno, i) => (
                <motion.div
                  key={aluno.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/professor/alunos/${aluno.id}`}>
                    <div className="card-interactive flex items-center gap-3 p-4">
                      <Avatar name={aluno.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                          {aluno.name}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                          {aluno.email}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {aluno.planoTreinoAtivoId ? (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                              <Dumbbell className="h-3 w-3" /> Ficha ativa
                            </span>
                          ) : (
                            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Sem ficha ativa</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutenticacaoStore } from '@/lib/store/auth-store';
import { usePlanoTreinoCompleto } from '@/lib/queries/use-plano-completo';
import { useConcluirTreino } from '@/lib/queries/use-treinos';
import { useCountdown } from '@/hooks/use-countdown';
import { useSolicitarFicha } from '@/lib/queries/use-solicitacoes-ficha';
import { useQueryClient } from '@tanstack/react-query';
import { SkeletonList } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { PageHeader } from '@/components/shared/page-header';
import { toast } from 'sonner';
import {
  Timer, CheckCircle2, Dumbbell, RotateCcw, UserCheck, ClipboardList,
  Clock, RefreshCw, ChevronLeft, ChevronRight, Target, Layers,
} from 'lucide-react';
import type { Aluno, ExercicioDivisao, DivisaoTreino } from '@/types';

// Paleta de cores para as abas de divisões

const DIV_COLORS = [
  { bg: 'var(--color-primary-muted)', text: 'var(--color-primary)', border: 'oklch(55% 0.28 290 / 0.3)', solid: 'var(--color-primary)' },
  { bg: 'rgba(99,102,241,0.1)', text: '#818cf8', border: 'rgba(99,102,241,0.3)', solid: '#6366f1' },
  { bg: 'rgba(16,185,129,0.1)', text: '#34d399', border: 'rgba(16,185,129,0.3)', solid: '#10b981' },
  { bg: 'rgba(245,158,11,0.1)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)', solid: '#f59e0b' },
  { bg: 'rgba(239,68,68,0.1)', text: '#f87171', border: 'rgba(239,68,68,0.3)', solid: '#ef4444' },
  { bg: 'rgba(236,72,153,0.1)', text: '#f472b6', border: 'rgba(236,72,153,0.3)', solid: '#ec4899' },
];



function ExercicioCard({
  ex,
  seriesConcluidas,
  isAtivo,
  onMarcarSerie,
  onIniciarDescanso,
}: {
  ex: ExercicioDivisao;
  seriesConcluidas: number;
  isAtivo: boolean;
  onMarcarSerie: () => void;
  onIniciarDescanso: () => void;
}) {
  const concluido = seriesConcluidas >= ex.series;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-primary-muted)' }}>
              <Dumbbell className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: concluido ? 'var(--color-text-muted)' : 'var(--color-text-primary)', textDecoration: concluido ? 'line-through' : 'none' }}>
                {ex.nome}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {ex.grupoMuscular} • {ex.series}×{ex.repeticoes}
                {ex.pesoKg ? ` • ${ex.pesoKg}kg` : ''}
                {ex.segundosDescanso > 0 && ` • ${ex.segundosDescanso}s descanso`}
              </p>
              {ex.observacoes && (
                <p className="text-[10px] mt-1 italic" style={{ color: 'var(--color-text-muted)' }}>
                  💡 {ex.observacoes}
                </p>
              )}
            </div>
          </div>


          <div className="flex gap-1.5 mb-3">
            {Array.from({ length: ex.series }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-2 rounded-full transition-all duration-300"
                style={{
                  background: i < seriesConcluidas
                    ? 'linear-gradient(90deg, var(--color-primary), var(--color-accent))'
                    : 'var(--color-bg-elevated)',
                }}
              />
            ))}
          </div>

          {concluido ? (
            <div className="flex items-center justify-center gap-2 h-10 rounded-xl" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400">Concluído</span>
            </div>
          ) : (
            <button
              onClick={() => {
                onMarcarSerie();
                if (seriesConcluidas + 1 < ex.series) onIniciarDescanso();
              }}
              className="w-full h-10 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: isAtivo ? 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' : 'var(--color-bg-elevated)',
                color: isAtivo ? 'white' : 'var(--color-text-muted)',
                border: isAtivo ? 'none' : '1px solid var(--color-border-subtle)',
              }}
            >
              Marcar série {seriesConcluidas + 1}/{ex.series}
            </button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}



export default function TreinoPage() {
  const { user } = useAutenticacaoStore();
  const queryClient = useQueryClient();
  const [student, setStudent] = useState<Aluno | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [divAtiva, setDivAtiva] = useState(0);

  // Estado de progresso: { [exId]: seriesConcluidas }
  const [progresso, setProgresso] = useState<Record<string, number>>({});

  // Timer de descanso
  const { display, isRunning, start, stop } = useCountdown(60);
  const [exEmDescanso, setExEmDescanso] = useState<string | null>(null);
  const [restSeconds, setRestSeconds] = useState(60);

  // Modal de solicitação de ficha
  const [solicitacaoModal, setSolicitacaoModal] = useState(false);
  const { mutate: solicitarFicha, isPending: solicitando } = useSolicitarFicha();
  const { mutateAsync: concluirTreino, isPending: finalizando } = useConcluirTreino();


  const carregarAluno = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/alunos?usuarioId=${user.id}`);
      if (res.ok) setStudent(await res.json());
    } finally {
      setLoadingStudent(false);
    }
  }, [user?.id]);

  useEffect(() => { carregarAluno(); }, [carregarAluno]);

  const { data: plano, isLoading: loadingPlano } = usePlanoTreinoCompleto(student?.planoTreinoAtivoId);


  useEffect(() => {
    if (plano?.divisoes) {
      setProgresso({});
      setDivAtiva(0);
    }
  }, [plano?.id]);

  const divisaoAtual: DivisaoTreino | undefined = plano?.divisoes?.[divAtiva];
  const temSolicitacaoPendente = !!student?.solicitacaoFichaEm;


  const exConcluidosNaDiv = divisaoAtual?.exercicios.filter(
    (ex) => (progresso[ex.id] ?? 0) >= ex.series
  ).length ?? 0;
  const totalExNaDiv = divisaoAtual?.exercicios.length ?? 0;
  const divisaoConcluida = totalExNaDiv > 0 && exConcluidosNaDiv >= totalExNaDiv;

  function marcarSerie(exId: string, totalSeries: number) {
    setProgresso((prev) => {
      const atual = prev[exId] ?? 0;
      return { ...prev, [exId]: Math.min(atual + 1, totalSeries) };
    });
  }

  function iniciarDescanso(exId: string, segundos: number) {
    setExEmDescanso(exId);
    setRestSeconds(segundos);
    start(segundos);
  }

  function reiniciarDivisao() {
    if (!divisaoAtual) return;
    const reset: Record<string, number> = {};
    divisaoAtual.exercicios.forEach((ex) => { reset[ex.id] = 0; });
    setProgresso((prev) => ({ ...prev, ...reset }));
  }

  async function handleFinalizarTreino() {
    if (!student || !plano) return;
    try {
      await concluirTreino({
        alunoId: student.id,
        planoTreinoId: plano.id,
        exerciciosConcluidos: Object.keys(progresso),
      });
      toast.success('Treino finalizado! Ótimo trabalho 💪');
      setProgresso({});
    } catch {
      toast.error('Erro ao salvar o treino.');
    }
  }

  async function handleAcaoVinculo(action: 'aceitar' | 'recusar') {
    if (!student) return;
    try {
      const res = await fetch('/api/alunos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: student.id, action }),
      });
      if (res.ok) {
        await carregarAluno();
        toast.success(action === 'aceitar' ? 'Treinador vinculado!' : 'Solicitação recusada.');
      }
    } catch {
      toast.error('Erro ao processar o vínculo.');
    }
  }

  function handleSolicitar(tipo: 'nova' | 'atualizacao') {
    if (!student) return;
    solicitarFicha(
      { alunoId: student.id, tipoSolicitacao: tipo },
      {
        onSuccess: async () => {
          setSolicitacaoModal(false);
          await carregarAluno();
          queryClient.invalidateQueries({ queryKey: ['alunos'] });
        },
      }
    );
  }



  if (loadingStudent || loadingPlano) return <SkeletonList count={4} />;

  return (
    <div className="space-y-4">


      {student?.solicitacaoProfessorId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ background: 'var(--color-primary-muted)', borderColor: 'oklch(55% 0.28 290 / 0.3)' }}
        >
          <div className="flex items-start gap-3">
            <UserCheck className="h-5 w-5 mt-0.5" style={{ color: 'var(--color-primary)' }} />
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Solicitação de Treinador</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>{student.nomeProfessorSolicitante}</strong> quer se vincular ao seu perfil.
              </p>
            </div>
          </div>
          <div className="flex gap-2 self-end sm:self-center">
            <Button size="sm" variant="ghost" className="text-rose-400 text-xs" onClick={() => handleAcaoVinculo('recusar')}>Recusar</Button>
            <Button size="sm" className="text-xs" onClick={() => handleAcaoVinculo('aceitar')}>Aceitar</Button>
          </div>
        </motion.div>
      )}


      {!plano ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-5">
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-bg-elevated)' }}>
            <Dumbbell className="h-8 w-8" style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <div>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Nenhuma ficha ativa</h2>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Solicite ao seu professor para criar uma ficha personalizada.
            </p>
          </div>
          {temSolicitacaoPendente ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-2xl flex items-start gap-3 max-w-sm w-full" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)' }}>
              <Clock className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-semibold text-amber-400">Solicitação enviada!</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  Tipo: {student?.tipoSolicitacaoFicha === 'nova' ? 'Nova ficha' : 'Atualização'}. Aguardando seu professor.
                </p>
              </div>
            </motion.div>
          ) : (
            <Button leftIcon={<ClipboardList className="h-4 w-4" />} onClick={() => setSolicitacaoModal(true)}>
              Solicitar Ficha de Treino
            </Button>
          )}
        </div>
      ) : (
        <>

          {temSolicitacaoPendente && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)' }}>
              <Clock className="h-4 w-4 text-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-400">
                <strong>Solicitação de atualização enviada.</strong> Aguardando professor.
              </p>
            </motion.div>
          )}


          <PageHeader
            title={plano.name}
            subtitle={plano.objetivo || `${plano.divisoes.length} divisões • ${plano.diasPorSemana}x/semana`}
            action={
              !temSolicitacaoPendente ? (
                <Button variant="ghost" size="sm" leftIcon={<RefreshCw className="h-3.5 w-3.5" />} onClick={() => setSolicitacaoModal(true)}>
                  Atualizar Ficha
                </Button>
              ) : undefined
            }
          />


          <div className="flex items-center gap-3 flex-wrap">
            {[
              { icon: Layers, label: `${plano.divisoes.length} divisões` },
              { icon: Dumbbell, label: `${plano.divisoes.reduce((a, d) => a + d.exercicios.length, 0)} exercícios` },
              { icon: Target, label: plano.dificuldade },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-subtle)' }}>
                <Icon className="h-3 w-3" /> {label}
              </span>
            ))}
          </div>


          <div className="relative">
            <div className="flex gap-2 overflow-x-auto pb-1 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
              {plano.divisoes.map((div, idx) => {
                const cor = DIV_COLORS[idx % DIV_COLORS.length];
                const isAtiva = divAtiva === idx;
                const exConcluidos = div.exercicios.filter((ex) => (progresso[ex.id] ?? 0) >= ex.series).length;
                const concluida = exConcluidos >= div.exercicios.length && div.exercicios.length > 0;

                return (
                  <button
                    key={div.id}
                    onClick={() => setDivAtiva(idx)}
                    className="flex-shrink-0 relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: isAtiva ? cor.bg : 'var(--color-bg-elevated)',
                      border: `1.5px solid ${isAtiva ? cor.border : 'var(--color-border-subtle)'}`,
                      color: isAtiva ? cor.text : 'var(--color-text-muted)',
                      transform: isAtiva ? 'scale(1.02)' : 'scale(1)',
                    }}
                  >
                    <span
                      className="h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
                      style={{ background: isAtiva ? cor.solid : 'var(--color-text-muted)' }}
                    >
                      {concluida ? '✓' : String.fromCharCode(65 + idx)}
                    </span>
                    <span className="truncate max-w-[120px]">{div.nome}</span>

                    {exConcluidos > 0 && !concluida && (
                      <span className="absolute bottom-0 left-0 h-0.5 rounded-full" style={{ width: `${(exConcluidos / div.exercicios.length) * 100}%`, background: cor.solid }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>


          <AnimatePresence mode="wait">
            {divisaoAtual && (
              <motion.div
                key={divisaoAtual.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }}
                className="space-y-3"
              >

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-black text-white flex-shrink-0" style={{ background: DIV_COLORS[divAtiva % DIV_COLORS.length].solid }}>
                      {String.fromCharCode(65 + divAtiva)}
                    </div>
                    <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {divisaoAtual.nome}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {exConcluidosNaDiv}/{totalExNaDiv}
                    </span>
                    <button
                      onClick={reiniciarDivisao}
                      className="h-7 w-7 flex items-center justify-center rounded-lg transition-colors hover:bg-white/5"
                      aria-label="Reiniciar divisão"
                    >
                      <RotateCcw className="h-3.5 w-3.5" style={{ color: 'var(--color-text-muted)' }} />
                    </button>
                  </div>
                </div>


                <div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-elevated)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${totalExNaDiv > 0 ? (exConcluidosNaDiv / totalExNaDiv) * 100 : 0}%` }}
                      transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                    />
                  </div>
                </div>

                {/* Timer de descanso (global da divisão) */}
                <AnimatePresence>
                  {isRunning && exEmDescanso && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, height: 0 }}
                      animate={{ opacity: 1, scale: 1, height: 'auto' }}
                      exit={{ opacity: 0, scale: 0.95, height: 0 }}
                      className="flex flex-col items-center gap-2 py-4 px-4 rounded-2xl"
                      style={{ background: 'var(--color-accent-muted)', border: '1px solid oklch(80% 0.18 80 / 0.25)' }}
                    >
                      <Timer className="h-5 w-5 text-amber-400" />
                      <p className="text-4xl font-black tabular-nums" style={{ color: 'var(--color-accent)' }}>{display}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Tempo de descanso — próxima série</p>
                      <button
                        onClick={() => { stop(); setExEmDescanso(null); }}
                        className="text-xs font-semibold px-4 py-1.5 rounded-full"
                        style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }}
                      >
                        Pular descanso
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>


                <div className="space-y-3">
                  {divisaoAtual.exercicios.map((ex) => (
                    <ExercicioCard
                      key={ex.id}
                      ex={ex}
                      seriesConcluidas={progresso[ex.id] ?? 0}
                      isAtivo={exEmDescanso !== ex.id && !isRunning}
                      onMarcarSerie={() => marcarSerie(ex.id, ex.series)}
                      onIniciarDescanso={() => iniciarDescanso(ex.id, ex.segundosDescanso)}
                    />
                  ))}
                </div>


                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setDivAtiva((v) => Math.max(0, v - 1))}
                    disabled={divAtiva === 0}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl transition-colors disabled:opacity-30"
                    style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)' }}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Anterior
                  </button>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {divAtiva + 1} / {plano.divisoes.length}
                  </span>
                  <button
                    onClick={() => setDivAtiva((v) => Math.min(plano.divisoes.length - 1, v + 1))}
                    disabled={divAtiva === plano.divisoes.length - 1}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl transition-colors disabled:opacity-30"
                    style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)' }}
                  >
                    Próxima <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>


                {divisaoConcluida && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    {divAtiva < plano.divisoes.length - 1 ? (
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={() => setDivAtiva((v) => v + 1)}
                        leftIcon={<ChevronRight className="h-4 w-4" />}
                      >
                        Ir para {plano.divisoes[divAtiva + 1]?.nome ?? 'próximo treino'}
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                        size="lg"
                        onClick={handleFinalizarTreino}
                        disabled={finalizando}
                        leftIcon={<CheckCircle2 className="h-4 w-4" />}
                      >
                        {finalizando ? 'Salvando...' : 'Finalizar Sessão de Treino 🏆'}
                      </Button>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}


      <Modal isOpen={solicitacaoModal} onClose={() => setSolicitacaoModal(false)} title="Solicitar Ficha de Treino">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Escolha o tipo de solicitação. Seu professor será notificado.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => handleSolicitar('nova')}
              disabled={solicitando}
              className="w-full p-4 rounded-xl text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{ background: 'var(--color-primary-muted)', border: '1px solid oklch(55% 0.28 290 / 0.25)' }}
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-primary)' }}>
                  <ClipboardList className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Criar Nova Ficha</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Não possuo ficha ou quero começar do zero</p>
                </div>
              </div>
            </button>
            {plano && (
              <button
                onClick={() => handleSolicitar('atualizacao')}
                disabled={solicitando}
                className="w-full p-4 rounded-xl text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16,185,129,0.2)' }}>
                    <RefreshCw className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Atualizar Ficha Atual</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Minha ficha precisa ser ajustada</p>
                  </div>
                </div>
              </button>
            )}
          </div>
          <Button variant="outline" className="w-full" onClick={() => setSolicitacaoModal(false)}>Cancelar</Button>
        </div>
      </Modal>
    </div>
  );
}
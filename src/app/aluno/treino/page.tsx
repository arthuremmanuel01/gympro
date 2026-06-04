'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutenticacaoStore } from '@/lib/store/auth-store';
import { usePlanoTreino, useConcluirTreino } from '@/lib/queries/use-treinos';
import { useTreinoStore } from '@/lib/store/treino-store';
import { useCountdown } from '@/hooks/use-countdown';
import { SkeletonList } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import {
  ChevronLeft,
  ChevronRight,
  Timer,
  CheckCircle2,
  Dumbbell,
  RotateCcw,
  UserCheck,
} from 'lucide-react';
import type { Aluno } from '@/types';

export default function TreinoPage() {
  const { user } = useAutenticacaoStore();
  const [student, setStudent] = useState<Aluno | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const { data: plan, isLoading: loadingPlan } = usePlanoTreino(student?.planoTreinoAtivoId);
  const { progressoExercicio, marcarSerie, reiniciarSessao } = useTreinoStore();

  const { display, isRunning, start, stop } = useCountdown(60);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [restingFor, setRestingFor] = useState<string | null>(null);

  const { mutateAsync: concluirTreino, isPending: finalizando } = useConcluirTreino();

  async function handleFinalizarTreino() {
    if (!student || !plan) return;

    try {
      await concluirTreino({
        alunoId: student.id,
        planoTreinoId: plan.id,
        exerciciosConcluidos: Object.keys(progressoExercicio),
      });

      alert('Treino finalizado com sucesso! Bom descanso.');
      reiniciarSessao(plan.exercicios);
      setCurrentExIndex(0);
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar o treino. Tente novamente.');
    }
  }

  async function carregarDadosAluno() {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/alunos?usuarioId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setStudent(data);
      }
    } catch (err) {
      console.error('Erro ao buscar cadastro atualizado do aluno', err);
    } finally {
      setLoadingStudent(false);
    }
  }

  useEffect(() => {
    carregarDadosAluno();
  }, [user?.id]);

  const isWorkoutComplete = plan?.exercicios.every(
    (ex) => (progressoExercicio[ex.id] ?? 0) >= ex.sets
  );

  async function handleAcaoVinculo(action: 'aceitar' | 'recusar') {
    if (!student) return;
    try {
      const res = await fetch('/api/alunos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: student.id, action }),
      });
      if (res.ok) {
        await carregarDadosAluno();
      }
    } catch (err) {
      alert('Erro ao processar resposta do vínculo.');
    }
  }

  if (loadingStudent || loadingPlan) return <SkeletonList count={4} />;

  return (
    <div className="space-y-4">
      {/* Solicitação Pendente de Vínculo */}
      {student?.solicitacaoProfessorId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{
            background: 'var(--color-primary-muted)',
            borderColor: 'oklch(55% 0.28 290 / 0.3)',
          }}
        >
          <div className="flex items-start gap-3">
            <UserCheck className="h-5 w-5 mt-0.5" style={{ color: 'var(--color-primary)' }} />
            <div>
              <h4 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Solicitação de Treinador
              </h4>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                O professor <strong style={{ color: 'var(--color-text-primary)' }}>{student.nomeProfessorSolicitante}</strong> quer se vincular ao seu perfil.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button size="sm" variant="ghost" className="text-rose-400 hover:bg-rose-500/10 text-xs" onClick={() => handleAcaoVinculo('recusar')}>
              Recusar
            </Button>
            <Button size="sm" onClick={() => handleAcaoVinculo('aceitar')} className="text-xs">
              Aceitar Vínculo
            </Button>
          </div>
        </motion.div>
      )}

      {!plan ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'var(--color-bg-elevated)' }}
          >
            <Dumbbell className="h-8 w-8" style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Nenhuma ficha ativa
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Peça ao seu professor para criar uma ficha de treino.
          </p>
        </div>
      ) : (
        <>
          <PageHeader
            title={plan.name}
            subtitle={`${plan.exercicios.length} exercícios • ${plan.diasPorSemana}x/semana`}
            action={
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                onClick={() => reiniciarSessao(plan.exercicios)} // <- Alterado aqui
              >
                Reiniciar
              </Button>
            }
          />

          <div>
            <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
              <span>{plan.exercicios.filter((ex) => (progressoExercicio[ex.id] ?? 0) >= ex.sets).length} de {plan.exercicios.length} exercícios</span>
              <span>{Math.round((plan.exercicios.filter((ex) => (progressoExercicio[ex.id] ?? 0) >= ex.sets).length / plan.exercicios.length) * 100)}%</span>
            </div>
            <div className="progress-bar h-2">
              <div className="progress-fill" style={{ width: `${Math.round((plan.exercicios.filter((ex) => (progressoExercicio[ex.id] ?? 0) >= ex.sets).length / plan.exercicios.length) * 100)}%` }} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentExIndex((i) => Math.max(0, i - 1))}
              disabled={currentExIndex === 0}
              aria-label="Exercício anterior"
              className="h-10 w-10 rounded-xl flex items-center justify-center transition-colors disabled:opacity-30"
              style={{ background: 'var(--color-bg-elevated)' }}
            >
              <ChevronLeft className="h-5 w-5" style={{ color: 'var(--color-text-primary)' }} />
            </button>

            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {currentExIndex + 1} / {plan.exercicios.length}
            </span>

            <button
              onClick={() => setCurrentExIndex((i) => Math.min(plan.exercicios.length - 1, i + 1))}
              disabled={currentExIndex === plan.exercicios.length - 1}
              aria-label="Próximo exercício"
              className="h-10 w-10 rounded-xl flex items-center justify-center transition-colors disabled:opacity-30"
              style={{ background: 'var(--color-bg-elevated)' }}
            >
              <ChevronRight className="h-5 w-5" style={{ color: 'var(--color-text-primary)' }} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={plan.exercicios[currentExIndex].id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card glass>
                <CardContent>
                  <span
                    className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3"
                    style={{
                      background: 'var(--color-primary-muted)',
                      color: 'var(--color-primary)',
                      border: '1px solid oklch(55% 0.28 290 / 0.2)',
                    }}
                  >
                    {plan.exercicios[currentExIndex].grupoMuscular}
                  </span>

                  <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    {plan.exercicios[currentExIndex].name}
                  </h2>

                  <div className="flex items-center gap-4 mt-3 mb-5">
                    <div className="text-center">
                      <p className="text-2xl font-black" style={{ color: 'var(--color-primary)' }}>
                        {plan.exercicios[currentExIndex].sets}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Séries</p>
                    </div>
                    <div className="w-px h-8" style={{ background: 'var(--color-border-subtle)' }} />
                    <div className="text-center">
                      <p className="text-2xl font-black" style={{ color: 'var(--color-accent)' }}>
                        {plan.exercicios[currentExIndex].reps}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Reps</p>
                    </div>
                    {plan.exercicios[currentExIndex].pesoKg && (
                      <>
                        <div className="w-px h-8" style={{ background: 'var(--color-border-subtle)' }} />
                        <div className="text-center">
                          <p className="text-2xl font-black" style={{ color: 'var(--color-text-primary)' }}>
                            {plan.exercicios[currentExIndex].pesoKg}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>kg</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2 mb-5">
                    {Array.from({ length: plan.exercicios[currentExIndex].sets }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 h-2 rounded-full transition-all duration-300"
                        style={{
                          background:
                            i < (progressoExercicio[plan.exercicios[currentExIndex].id] ?? 0)
                              ? 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%)'
                              : 'var(--color-bg-elevated)',
                        }}
                      />
                    ))}
                  </div>

                  {plan.exercicios[currentExIndex].notes && (
                    <p className="text-xs p-3 rounded-xl mb-4" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-subtle)' }}>
                      💡 {plan.exercicios[currentExIndex].notes}
                    </p>
                  )}

                  {restingFor === plan.exercicios[currentExIndex].id && isRunning && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3 p-4 rounded-xl mb-4" style={{ background: 'var(--color-accent-muted)', border: '1px solid oklch(80% 0.18 80 / 0.25)' }}>
                      <Timer className="h-5 w-5 text-amber-400" />
                      <p className="text-4xl font-black tabular-nums" style={{ color: 'var(--color-accent)' }}>{display}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Tempo de descanso</p>
                      <button onClick={() => { stop(); setRestingFor(null); }} className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }}>
                        Pular descanso
                      </button>
                    </motion.div>
                  )}

                  {(progressoExercicio[plan.exercicios[currentExIndex].id] ?? 0) >= plan.exercicios[currentExIndex].sets ? (
                    <div className="flex items-center justify-center gap-2 h-12 rounded-xl" style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      <span className="font-semibold text-emerald-400">Exercício concluído!</span>
                    </div>
                  ) : (
                    <Button
                      id={`mark-set-btn-${plan.exercicios[currentExIndex].id}`}
                      className="w-full"
                      size="lg"
                      onClick={() => {
                        marcarSerie(plan.exercicios[currentExIndex].id, plan.exercicios[currentExIndex].sets);
                        if ((progressoExercicio[plan.exercicios[currentExIndex].id] ?? 0) + 1 < plan.exercicios[currentExIndex].sets) {
                          setRestingFor(plan.exercicios[currentExIndex].id);
                          start(plan.exercicios[currentExIndex].segundosDescanso);
                        }
                      }}
                      disabled={restingFor === plan.exercicios[currentExIndex].id && isRunning}
                    >
                      Marcar série {(progressoExercicio[plan.exercicios[currentExIndex].id] ?? 0) + 1}/{plan.exercicios[currentExIndex].sets}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Todos os Exercícios
            </h3>
            {plan.exercicios.map((ex, idx) => {
              const done = (progressoExercicio[ex.id] ?? 0) >= ex.sets;
              return (
                <button
                  key={ex.id}
                  onClick={() => setCurrentExIndex(idx)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors"
                  style={{
                    background: idx === currentExIndex ? 'var(--color-primary-muted)' : 'var(--color-bg-surface)',
                    border: `1px solid ${idx === currentExIndex ? 'oklch(55% 0.28 290 / 0.3)' : 'var(--color-border-subtle)'}`,
                  }}
                  aria-current={idx === currentExIndex ? 'true' : undefined}
                >
                  <div
                    className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: done ? 'rgba(16, 185, 129, 0.2)' : idx === currentExIndex ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
                      color: done ? '#10b981' : idx === currentExIndex ? 'white' : 'var(--color-text-muted)',
                    }}
                  >
                    {done ? '✓' : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: done ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}>
                      {ex.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {ex.sets}x{ex.reps} {ex.pesoKg ? `• ${ex.pesoKg}kg` : ''}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          {isWorkoutComplete && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
              <Button
                size="lg"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50"
                onClick={handleFinalizarTreino}
                disabled={finalizando}
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                {finalizando ? 'Salvando...' : 'Finalizar Treino e Salvar'}
              </Button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
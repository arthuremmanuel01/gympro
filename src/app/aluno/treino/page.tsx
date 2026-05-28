'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutenticacaoStore } from '@/lib/store/auth-store';
import { useAlunoPorUsuarioId } from '@/lib/queries/use-alunos';
import { usePlanoTreino } from '@/lib/queries/use-treinos';
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
} from 'lucide-react';

export default function TreinoPage() {
  const { user } = useAutenticacaoStore();
  const { data: student, isLoading: loadingStudent } = useAlunoPorUsuarioId(user?.id ?? '');
  const { data: plan, isLoading: loadingPlan } = usePlanoTreino(student?.planoTreinoAtivoId);
  const { progressoExercicio, marcarSerie, reiniciarSessao } = useTreinoStore();

  const { display, isRunning, start, stop } = useCountdown(60);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [restingFor, setRestingFor] = useState<string | null>(null);

  if (loadingStudent || loadingPlan) return <SkeletonList count={4} />;

  if (!plan) {
    return (
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
    );
  }

  const exercicios = plan.exercicios;
  const exercise = exercicios[currentExIndex];
  const seriesConcluidas = progressoExercicio[exercise.id] ?? 0;
  const totalCompleted = exercicios.filter((ex) => (progressoExercicio[ex.id] ?? 0) >= ex.sets).length;
  const overallProgress = Math.round((totalCompleted / exercicios.length) * 100);

  function handleMarkSet() {
    marcarSerie(exercise.id, exercise.sets);
    const newCompleted = (progressoExercicio[exercise.id] ?? 0) + 1;
    if (newCompleted < exercise.sets) {
      
      setRestingFor(exercise.id);
      start(exercise.segundosDescanso);
    }
  }

  function handleTimerDone() {
    stop();
    setRestingFor(null);
  }

  const isResting = restingFor === exercise.id && isRunning;

  return (
    <div className="space-y-4">
      <PageHeader
        title={plan.name}
        subtitle={`${exercicios.length} exercícios • ${plan.diasPorSemana}x/semana`}
        action={
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
            onClick={() => reiniciarSessao(plan.id)}
          >
            Reiniciar
          </Button>
        }
      />

      {/* Progresso geral */}
      <div>
        <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
          <span>{totalCompleted} de {exercicios.length} exercícios</span>
          <span>{overallProgress}%</span>
        </div>
        <div className="progress-bar h-2">
          <div className="progress-fill" style={{ width: `${overallProgress}%` }} />
        </div>
      </div>

      {/* Navegação pelos exercícios */}
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
          {currentExIndex + 1} / {exercicios.length}
        </span>

        <button
          onClick={() => setCurrentExIndex((i) => Math.min(exercicios.length - 1, i + 1))}
          disabled={currentExIndex === exercicios.length - 1}
          aria-label="Próximo exercício"
          className="h-10 w-10 rounded-xl flex items-center justify-center transition-colors disabled:opacity-30"
          style={{ background: 'var(--color-bg-elevated)' }}
        >
          <ChevronRight className="h-5 w-5" style={{ color: 'var(--color-text-primary)' }} />
        </button>
      </div>

      {/* cartão do Exercicio  */}
      <AnimatePresence mode="wait">
        <motion.div
          key={exercise.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card glass>
            <CardContent>
              {/* Grupo muscular */}
              <span
                className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3"
                style={{
                  background: 'var(--color-primary-muted)',
                  color: 'var(--color-primary)',
                  border: '1px solid oklch(55% 0.28 290 / 0.2)',
                }}
              >
                {exercise.grupoMuscular}
              </span>

              <h2
                className="text-xl font-bold mb-1"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {exercise.name}
              </h2>

              {/* Estatisticas */}
              <div className="flex items-center gap-4 mt-3 mb-5">
                <div className="text-center">
                  <p className="text-2xl font-black" style={{ color: 'var(--color-primary)' }}>
                    {exercise.sets}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Séries</p>
                </div>
                <div
                  className="w-px h-8"
                  style={{ background: 'var(--color-border-subtle)' }}
                />
                <div className="text-center">
                  <p className="text-2xl font-black" style={{ color: 'var(--color-accent)' }}>
                    {exercise.reps}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Reps</p>
                </div>
                {exercise.pesoKg && (
                  <>
                    <div
                      className="w-px h-8"
                      style={{ background: 'var(--color-border-subtle)' }}
                    />
                    <div className="text-center">
                      <p className="text-2xl font-black" style={{ color: 'var(--color-text-primary)' }}>
                        {exercise.pesoKg}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>kg</p>
                    </div>
                  </>
                )}
              </div>

              {/* Progresso das séries */}
              <div className="flex gap-2 mb-5">
                {Array.from({ length: exercise.sets }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-2 rounded-full transition-all duration-300"
                    style={{
                      background:
                        i < seriesConcluidas
                          ? 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%)'
                          : 'var(--color-bg-elevated)',
                    }}
                  />
                ))}
              </div>

              {exercise.notes && (
                <p
                  className="text-xs p-3 rounded-xl mb-4"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    color: 'var(--color-text-muted)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                >
                  💡 {exercise.notes}
                </p>
              )}

              {/* Temporizador de descanso */}
              {isResting && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl mb-4"
                  style={{
                    background: 'var(--color-accent-muted)',
                    border: '1px solid oklch(80% 0.18 80 / 0.25)',
                  }}
                >
                  <Timer className="h-5 w-5 text-amber-400" />
                  <p
                    className="text-4xl font-black tabular-nums"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    {display}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Tempo de descanso</p>
                  <button
                    onClick={handleTimerDone}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
                    style={{
                      background: 'var(--color-bg-elevated)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    Pular descanso
                  </button>
                </motion.div>
              )}

              {/* Botão de ação */}
              {seriesConcluidas >= exercise.sets ? (
                <div
                  className="flex items-center justify-center gap-2 h-12 rounded-xl"
                  style={{
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <span className="font-semibold text-emerald-400">Exercício concluído!</span>
                </div>
              ) : (
                <Button
                  id={`mark-set-btn-${exercise.id}`}
                  className="w-full"
                  size="lg"
                  onClick={handleMarkSet}
                  disabled={isResting}
                >
                  Marcar série {seriesConcluidas + 1}/{exercise.sets}
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Visão geral da lista de exercícios */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
          Todos os Exercícios
        </h3>
        {exercicios.map((ex, idx) => {
          const done = (progressoExercicio[ex.id] ?? 0) >= ex.sets;
          return (
            <button
              key={ex.id}
              onClick={() => setCurrentExIndex(idx)}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors"
              style={{
                background: idx === currentExIndex ? 'var(--color-primary-muted)' : 'var(--color-bg-surface)',
                border: `1px solid ${
                  idx === currentExIndex ? 'oklch(55% 0.28 290 / 0.3)' : 'var(--color-border-subtle)'
                }`,
              }}
              aria-current={idx === currentExIndex ? 'true' : undefined}
            >
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: done
                    ? 'rgba(16, 185, 129, 0.2)'
                    : idx === currentExIndex
                    ? 'var(--color-primary)'
                    : 'var(--color-bg-elevated)',
                  color: done
                    ? '#10b981'
                    : idx === currentExIndex
                    ? 'white'
                    : 'var(--color-text-muted)',
                }}
              >
                {done ? '✓' : idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: done ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}
                >
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
    </div>
  );
}

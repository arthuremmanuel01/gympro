'use client';
import { use, useState } from 'react';
import { motion } from 'framer-motion';
import { useStudent } from '@/lib/queries/use-alunos';
import { usePlanoTreino, useUpdateWorkoutPlan } from '@/lib/queries/use-treinos';
import { SkeletonCard } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/shared/avatar';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import {
  formatCurrency,
  formatDate,
  getPaymentStatusBg,
  getPaymentStatusLabel,
} from '@/lib/utils';
import {
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Dumbbell,
  Plus,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import type { Exercicio } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

function generateId() {
  return `ex-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function StudentDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: student, isLoading: loadingStudent } = useStudent(id);
  const { data: plan, isLoading: loadingPlan } = usePlanoTreino(student?.planoTreinoAtivoId);
  const { mutate: updatePlan, isPending } = useUpdateWorkoutPlan();

  const [addExModal, setAddExModal] = useState(false);
  const [newEx, setNewEx] = useState<Partial<Exercicio>>({
    name: '',
    grupoMuscular: '',
    sets: 3,
    reps: '10-12',
    segundosDescanso: 60,
    pesoKg: undefined,
    notes: '',
  });

  function handleAddExercise() {
    if (!plan || !newEx.name || !newEx.grupoMuscular) return;
    const exercise: Exercicio = {
      id: generateId(),
      name: newEx.name ?? '',
      grupoMuscular: newEx.grupoMuscular ?? '',
      sets: newEx.sets ?? 3,
      reps: newEx.reps ?? '10',
      segundosDescanso: newEx.segundosDescanso ?? 60,
      pesoKg: newEx.pesoKg,
      notes: newEx.notes,
      seriesConcluidas: 0,
    };
    updatePlan({ ...plan, exercicios: [...plan.exercicios, exercise] });
    setAddExModal(false);
    setNewEx({ name: '', grupoMuscular: '', sets: 3, reps: '10-12', segundosDescanso: 60 });
  }

  function handleRemoveExercise(exId: string) {
    if (!plan) return;
    updatePlan({ ...plan, exercicios: plan.exercicios.filter((ex) => ex.id !== exId) });
  }

  if (loadingStudent) return <SkeletonCard lines={5} />;
  if (!student) return <div style={{ color: 'var(--color-text-muted)' }}>Aluno não encontrado.</div>;

  return (
    <div className="space-y-5">
      <Link
        href="/professor/alunos"
        className="inline-flex items-center gap-1.5 text-sm mb-1"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      {/* Aluno Info */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card glass>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Avatar name={student.name} size="lg" />
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {student.name}
                </h1>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ring-1 ring-inset ${getPaymentStatusBg(student.statusPagamento)}`}
                >
                  {getPaymentStatusLabel(student.statusPagamento)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{student.email}</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>{student.phone}</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>Desde {formatDate(student.matriculadoEm)}</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                <CreditCard className="h-4 w-4 flex-shrink-0" />
                <span>{formatCurrency(student.mensalidade)}/mês</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Plano de treino */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
            Ficha de Treino
          </h2>
          {plan && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => setAddExModal(true)}
            >
              Adicionar Exercício
            </Button>
          )}
        </div>

        {loadingPlan ? (
          <SkeletonCard />
        ) : plan ? (
          <div className="space-y-2">
            <div
              className="p-3 rounded-xl text-sm mb-3"
              style={{
                background: 'var(--color-primary-muted)',
                border: '1px solid oklch(55% 0.28 290 / 0.2)',
              }}
            >
              <p className="font-bold" style={{ color: 'var(--color-primary)' }}>{plan.name}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {plan.exercicios.length} exercícios • {plan.diasPorSemana}x/semana • {plan.dificuldade}
              </p>
            </div>
            {plan.exercicios.map((ex) => (
              <Card key={ex.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--color-primary-muted)' }}
                    >
                      <Dumbbell className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {ex.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {ex.grupoMuscular} • {ex.sets}x{ex.reps}
                        {ex.pesoKg ? ` • ${ex.pesoKg}kg` : ''}
                      </p>
                      {ex.notes && (
                        <p className="text-xs mt-1 italic" style={{ color: 'var(--color-text-muted)' }}>
                          {ex.notes}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveExercise(ex.id)}
                      aria-label={`Remover ${ex.name}`}
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Dumbbell className="h-8 w-8 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Aluno sem ficha de treino cadastrada.
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Add Exercicio Modal */}
      <Modal
        isOpen={addExModal}
        onClose={() => setAddExModal(false)}
        title="Adicionar Exercício"
      >
        <div className="space-y-4">
          <Input
            id="ex-name"
            label="Nome do Exercício"
            placeholder="Ex: Supino Reto"
            value={newEx.name}
            onChange={(e) => setNewEx((v) => ({ ...v, name: e.target.value }))}
          />
          <Input
            id="ex-muscle"
            label="Grupo Muscular"
            placeholder="Ex: Peito"
            value={newEx.grupoMuscular}
            onChange={(e) => setNewEx((v) => ({ ...v, grupoMuscular: e.target.value }))}
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              id="ex-sets"
              label="Séries"
              type="number"
              inputMode="numeric"
              value={newEx.sets ?? 3}
              onChange={(e) => setNewEx((v) => ({ ...v, sets: Number(e.target.value) }))}
            />
            <Input
              id="ex-reps"
              label="Reps"
              placeholder="10-12"
              value={newEx.reps}
              onChange={(e) => setNewEx((v) => ({ ...v, reps: e.target.value }))}
            />
            <Input
              id="ex-weight"
              label="Peso (kg)"
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={newEx.pesoKg ?? ''}
              onChange={(e) =>
                setNewEx((v) => ({ ...v, pesoKg: e.target.value ? Number(e.target.value) : undefined }))
              }
            />
          </div>
          <Input
            id="ex-rest"
            label="Descanso (segundos)"
            type="number"
            inputMode="numeric"
            value={newEx.segundosDescanso ?? 60}
            onChange={(e) => setNewEx((v) => ({ ...v, segundosDescanso: Number(e.target.value) }))}
          />
          <Input
            id="ex-notes"
            label="Observações (opcional)"
            placeholder="Ex: Manter coluna neutra"
            value={newEx.notes ?? ''}
            onChange={(e) => setNewEx((v) => ({ ...v, notes: e.target.value }))}
          />
          <div className="flex gap-3 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setAddExModal(false)}>
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handleAddExercise}
              carregando={isPending}
              disabled={!newEx.name || !newEx.grupoMuscular}
            >
              Adicionar Exercício
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

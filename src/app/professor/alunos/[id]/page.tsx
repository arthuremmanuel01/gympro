'use client';
import { use, useState } from 'react';
import { useForm, useFieldArray, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAutenticacaoStore } from '@/lib/store/auth-store';
import { useStudent } from '@/lib/queries/use-alunos';
import { usePlanoTreinoCompleto, useCriarPlanoCompleto, useAtualizarPlanoCompleto } from '@/lib/queries/use-plano-completo';
import { useQueryClient } from '@tanstack/react-query';
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
  Phone, Mail, Calendar, CreditCard, Dumbbell, Plus, Trash2, ArrowLeft,
  ChevronDown, ChevronUp, GripVertical, Save, RefreshCw, Clock, Target,
  Layers, CheckCircle2, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { DificuldadeTreino } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}



const exercicioSchema = z.object({
  nome: z.string().min(1, 'Nome obrigatório'),
  grupoMuscular: z.string().min(1, 'Grupo muscular obrigatório'),
  series: z.number().int().min(1, 'Mín. 1').max(20),
  repeticoes: z.string().min(1, 'Ex: 10-12'),
  pesoKg: z.number().optional(),
  segundosDescanso: z.number().int().min(0),
  observacoes: z.string().optional(),
});

const divisaoSchema = z.object({
  nome: z.string().min(1, 'Nome da divisão obrigatório'),
  exercicios: z.array(exercicioSchema).min(1, 'Adicione ao menos 1 exercício'),
});

const fichaSchema = z.object({
  name: z.string().min(1, 'Nome da ficha obrigatório').max(80),
  dificuldade: z.enum(['iniciante', 'intermediario', 'avancado'] as const),
  diasPorSemana: z.number().int().min(1).max(7),
  objetivo: z.string().optional(),
  divisoes: z.array(divisaoSchema).min(1, 'Adicione ao menos 1 divisão'),
});

type FichaFormData = z.infer<typeof fichaSchema>;



const SUGESTOES_DIVISOES = [
  'Treino A — Peito e Tríceps',
  'Treino B — Costas e Bíceps',
  'Treino C — Ombros e Trapézio',
  'Treino D — Pernas e Glúteos',
  'Treino E — Braços e Core',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
];

const GRUPOS_MUSCULARES = [
  'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Antebraço',
  'Quadríceps', 'Posterior de Coxa', 'Glúteos', 'Panturrilha',
  'Abdômen', 'Trapézio', 'Core', 'Lombar',
];



function ExercicioRow({
  divIdx,
  exIdx,
  register,
  errors,
  onRemove,
  isLast,
}: {
  divIdx: number;
  exIdx: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
  onRemove: () => void;
  isLast: boolean;
}) {
  const prefix = `divisoes.${divIdx}.exercicios.${exIdx}` as const;
  const exErrors = errors?.divisoes?.[divIdx]?.exercicios?.[exIdx];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      className="p-3 rounded-xl space-y-3"
      style={{
        background: 'var(--color-bg-base)',
        border: '1px solid var(--color-border-subtle)',
      }}
    >

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 opacity-30 cursor-grab" />
          <span className="text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>
            Exercício {exIdx + 1}
          </span>
        </div>
        {!isLast && (
          <button
            type="button"
            onClick={onRemove}
            className="h-6 w-6 flex items-center justify-center rounded-md text-red-400 hover:bg-red-500/10 transition-colors"
            aria-label="Remover exercício"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>


      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
            Nome *
          </label>
          <input
            placeholder="Ex: Supino Reto"
            {...register(`${prefix}.nome`)}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors"
            style={{
              background: 'var(--color-bg-elevated)',
              border: `1px solid ${exErrors?.nome ? '#ef4444' : 'var(--color-border-subtle)'}`,
              color: 'var(--color-text-primary)',
            }}
          />
          {exErrors?.nome && <p className="text-[10px] text-red-400">{exErrors.nome.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
            Grupo Muscular *
          </label>
          <select
            {...register(`${prefix}.grupoMuscular`)}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{
              background: 'var(--color-bg-elevated)',
              border: `1px solid ${exErrors?.grupoMuscular ? '#ef4444' : 'var(--color-border-subtle)'}`,
              color: 'var(--color-text-primary)',
            }}
          >
            <option value="">Selecionar...</option>
            {GRUPOS_MUSCULARES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          {exErrors?.grupoMuscular && <p className="text-[10px] text-red-400">{exErrors.grupoMuscular.message}</p>}
        </div>
      </div>


      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Séries', key: 'series', placeholder: '4', type: 'number' },
          { label: 'Reps', key: 'repeticoes', placeholder: '10-12', type: 'text' },
          { label: 'Carga (kg)', key: 'pesoKg', placeholder: '—', type: 'number' },
          { label: 'Descanso (s)', key: 'segundosDescanso', placeholder: '60', type: 'number' },
        ].map(({ label, key, placeholder, type }) => (
          <div key={key} className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
              {label}
            </label>
            <input
              type={type}
              inputMode={type === 'number' ? 'numeric' : undefined}
              placeholder={placeholder}
              {...register(
                `${prefix}.${key}`,
                key !== 'repeticoes' ? { valueAsNumber: true } : {}
              )}
              className="w-full px-2 py-2 rounded-lg text-sm text-center outline-none"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-subtle)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>
        ))}
      </div>


      <div className="space-y-1">
        <label className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
          Observações
        </label>
        <input
          placeholder="Ex: Manter escápulas retraídas, foco na contração"
          {...register(`${prefix}.observacoes`)}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-subtle)',
            color: 'var(--color-text-primary)',
          }}
        />
      </div>
    </motion.div>
  );
}



function DivisaoCard({
  divIdx,
  register,
  control,
  errors,
  onRemoveDivisao,
  totalDivisoes,
}: {
  divIdx: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
  onRemoveDivisao: () => void;
  totalDivisoes: number;
}) {
  const [aberta, setAberta] = useState(true);

  const { fields: exercicios, append, remove } = useFieldArray({
    control,
    name: `divisoes.${divIdx}.exercicios`,
  });

  const nomeDivisao = useWatch({ control, name: `divisoes.${divIdx}.nome` });
  const divErrors = errors?.divisoes?.[divIdx];

  function addExercicio() {
    append({
      nome: '',
      grupoMuscular: '',
      series: 3,
      repeticoes: '10-12',
      pesoKg: undefined,
      segundosDescanso: 60,
      observacoes: '',
    });
  }

  const BADGE_COLORS = [
    'var(--color-primary)', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899',
  ];
  const cor = BADGE_COLORS[divIdx % BADGE_COLORS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ border: `1.5px solid ${cor}30` }}
    >

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setAberta((v) => !v);
          }
        }}
        onClick={() => setAberta((v) => !v)}
        className="w-full flex items-center gap-3 p-4 text-left transition-colors cursor-pointer"
        style={{ background: `${cor}10` }}
      >
        <div
          className="h-7 w-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 text-white"
          style={{ background: cor }}
        >
          {String.fromCharCode(65 + divIdx)}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-bold truncate"
            style={{ color: nomeDivisao ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}
          >
            {nomeDivisao || `Divisão ${divIdx + 1} (sem nome)`}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
            {exercicios.length} exercício{exercicios.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {totalDivisoes > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemoveDivisao(); }}
              className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
              aria-label="Remover divisão"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          {aberta ? (
            <ChevronUp className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
          ) : (
            <ChevronDown className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
          )}
        </div>
      </div>


      <AnimatePresence>
        {aberta && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="p-4 space-y-4" style={{ background: 'var(--color-bg-surface)' }}>

              <div className="space-y-1">
                <label className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                  Nome da Divisão *
                </label>
                <div className="flex gap-2">
                  <input
                    placeholder="Ex: Treino A — Peito e Tríceps"
                    {...register(`divisoes.${divIdx}.nome`)}
                    className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{
                      background: 'var(--color-bg-elevated)',
                      border: `1px solid ${divErrors?.nome ? '#ef4444' : 'var(--color-border-default)'}`,
                      color: 'var(--color-text-primary)',
                    }}
                    list={`sugestoes-divisao-${divIdx}`}
                  />
                  <datalist id={`sugestoes-divisao-${divIdx}`}>
                    {SUGESTOES_DIVISOES.map((s) => <option key={s} value={s} />)}
                  </datalist>
                </div>
                {divErrors?.nome && (
                  <p className="text-xs text-red-400">{divErrors.nome.message}</p>
                )}
              </div>


              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                    Exercícios
                  </p>
                  {divErrors?.exercicios && typeof divErrors.exercicios?.message === 'string' && (
                    <p className="text-xs text-red-400">{divErrors.exercicios.message}</p>
                  )}
                </div>

                <AnimatePresence>
                  {exercicios.map((ex, exIdx) => (
                    <ExercicioRow
                      key={ex.id}
                      divIdx={divIdx}
                      exIdx={exIdx}
                      register={register}
                      errors={errors}
                      onRemove={() => remove(exIdx)}
                      isLast={exercicios.length === 1}
                    />
                  ))}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={addExercicio}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                  style={{
                    background: `${cor}10`,
                    border: `1px dashed ${cor}60`,
                    color: cor,
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar Exercício à {nomeDivisao || 'esta divisão'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}



export default function StudentDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAutenticacaoStore();
  const queryClient = useQueryClient();
  const { data: student, isLoading: loadingStudent } = useStudent(id);
  const { data: plano, isLoading: loadingPlano } = usePlanoTreinoCompleto(student?.planoTreinoAtivoId);
  const { mutate: criarPlano, isPending: criando } = useCriarPlanoCompleto();
  const { mutate: atualizarPlano, isPending: atualizando } = useAtualizarPlanoCompleto();
  const [fichaModal, setFichaModal] = useState(false);
  const [modoEditar, setModoEditar] = useState(false);

  const isPending = criando || atualizando;


  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FichaFormData>({
    resolver: zodResolver(fichaSchema),
    defaultValues: {
      name: '',
      dificuldade: 'intermediario',
      diasPorSemana: 3,
      objetivo: '',
      divisoes: [
        {
          nome: '',
          exercicios: [{ nome: '', grupoMuscular: '', series: 3, repeticoes: '10-12', segundosDescanso: 60 }],
        },
      ],
    },
  });

  const { fields: divisoes, append: addDivisao, remove: removeDivisao } = useFieldArray({
    control,
    name: 'divisoes',
  });

  function abrirCriar() {
    setModoEditar(false);
    reset({
      name: '',
      dificuldade: 'intermediario',
      diasPorSemana: 3,
      objetivo: '',
      divisoes: [
        { nome: '', exercicios: [{ nome: '', grupoMuscular: '', series: 3, repeticoes: '10-12', segundosDescanso: 60 }] },
      ],
    });
    setFichaModal(true);
  }

  function abrirEditar() {
    if (!plano) return;
    setModoEditar(true);
    reset({
      name: plano.name,
      dificuldade: plano.dificuldade,
      diasPorSemana: plano.diasPorSemana,
      objetivo: plano.objetivo || '',
      divisoes: plano.divisoes.map((div) => ({
        nome: div.nome,
        exercicios: div.exercicios.map((ex) => ({
          nome: ex.nome,
          grupoMuscular: ex.grupoMuscular,
          series: ex.series,
          repeticoes: ex.repeticoes,
          pesoKg: ex.pesoKg ?? undefined,
          segundosDescanso: ex.segundosDescanso,
          observacoes: ex.observacoes ?? undefined,
        })),
      })),
    });
    setFichaModal(true);
  }

  function onSubmit(data: FichaFormData) {
    const professorId = user?.id ?? student?.professorId ?? '';
    const payload = {
      name: data.name,
      alunoId: student!.id,
      professorId,
      dificuldade: data.dificuldade,
      diasPorSemana: data.diasPorSemana,
      objetivo: data.objetivo || undefined,
      divisoes: data.divisoes,
    };

    if (modoEditar && plano) {
      atualizarPlano(
        { ...payload, id: plano.id },
        {
          onSuccess: () => {
            toast.success('Ficha atualizada com sucesso!');
            setFichaModal(false);
            queryClient.invalidateQueries({ queryKey: ['plano-treino-completo', plano.id] });
          },
        }
      );
    } else {
      criarPlano(payload, {
        onSuccess: (res) => {
          toast.success(`Ficha "${data.name}" criada com sucesso!`);
          setFichaModal(false);
          queryClient.invalidateQueries({ queryKey: ['alunos', id] });
          queryClient.invalidateQueries({ queryKey: ['plano-treino-completo', res.id] });
        },
      });
    }
  }



  if (loadingStudent) return <SkeletonCard lines={5} />;
  if (!student) return <div style={{ color: 'var(--color-text-muted)' }}>Aluno não encontrado.</div>;

  return (
    <div className="space-y-5">
      <Link href="/professor/alunos" className="inline-flex items-center gap-1.5 text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>


      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card glass>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Avatar name={student.name} size="lg" />
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {student.name}
                </h1>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ring-1 ring-inset ${getPaymentStatusBg(student.statusPagamento)}`}>
                  {getPaymentStatusLabel(student.statusPagamento)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                <Mail className="h-4 w-4 flex-shrink-0" /><span className="truncate">{student.email}</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                <Phone className="h-4 w-4 flex-shrink-0" /><span>{student.phone}</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                <Calendar className="h-4 w-4 flex-shrink-0" /><span>Desde {formatDate(student.matriculadoEm)}</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                <CreditCard className="h-4 w-4 flex-shrink-0" /><span>{formatCurrency(student.mensalidade)}/mês</span>
              </div>
            </div>

            {student.solicitacaoFichaEm && (
              <div className="mt-4 p-3 rounded-xl flex items-center gap-2 text-xs" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}>
                <span>⏳</span>
                <span>
                  Solicitação de <strong>{student.tipoSolicitacaoFicha === 'nova' ? 'nova ficha' : 'atualização'}</strong> em{' '}
                  {new Date(student.solicitacaoFichaEm).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>


      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
            Ficha de Treino
          </h2>
          <div className="flex gap-2">
            {plano && (
              <Button variant="ghost" size="sm" leftIcon={<RefreshCw className="h-3.5 w-3.5" />} onClick={abrirEditar}>
                Editar Ficha
              </Button>
            )}
            {!plano && (
              <Button variant="primary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={abrirCriar}>
                Criar Ficha
              </Button>
            )}
          </div>
        </div>

        {loadingPlano ? (
          <SkeletonCard />
        ) : plano && plano.divisoes?.length > 0 ? (
          <div className="space-y-3">

            <div className="p-4 rounded-2xl" style={{ background: 'var(--color-primary-muted)', border: '1px solid oklch(55% 0.28 290 / 0.2)' }}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-base" style={{ color: 'var(--color-primary)' }}>{plano.name}</p>
                  {plano.objetivo && (
                    <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                      <Target className="h-3 w-3" /> {plano.objetivo}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)' }}>
                    {plano.dificuldade}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> {plano.divisoes.length} divisões</span>
                <span className="flex items-center gap-1"><Dumbbell className="h-3.5 w-3.5" /> {plano.divisoes.reduce((a, d) => a + d.exercicios.length, 0)} exercícios</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {plano.diasPorSemana}x/semana</span>
              </div>
            </div>


            {plano.divisoes.map((div, dIdx) => {
              const BADGE_COLORS = ['var(--color-primary)', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
              const cor = BADGE_COLORS[dIdx % BADGE_COLORS.length];
              return (
                <Card key={div.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-black text-white flex-shrink-0" style={{ background: cor }}>
                        {String.fromCharCode(65 + dIdx)}
                      </div>
                      <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{div.nome}</p>
                      <span className="ml-auto text-xs" style={{ color: 'var(--color-text-muted)' }}>{div.exercicios.length} ex.</span>
                    </div>
                    <div className="space-y-2">
                      {div.exercicios.map((ex, eIdx) => (
                        <div key={ex.id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: 'var(--color-bg-elevated)' }}>
                          <div className="h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: 'var(--color-bg-surface)', color: 'var(--color-text-muted)' }}>
                            {eIdx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{ex.nome}</p>
                            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{ex.grupoMuscular}</p>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-semibold flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                            <span className="px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-surface)' }}>{ex.series} séries</span>
                            <span className="px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-surface)' }}>{ex.repeticoes} reps</span>
                            {ex.pesoKg && <span className="px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-surface)' }}>{ex.pesoKg}kg</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-10">
              <Dumbbell className="h-8 w-8 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Sem ficha cadastrada</p>
              <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
                Crie uma ficha com divisões por dia da semana ou letra.
              </p>
              <Button size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={abrirCriar}>
                Criar Primeira Ficha
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>




      <Modal
        isOpen={fichaModal}
        onClose={() => setFichaModal(false)}
        title={modoEditar ? 'Editar Ficha de Treino' : 'Nova Ficha de Treino'}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

          <div className="p-4 rounded-2xl space-y-4" style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-subtle)' }}>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Dados Gerais
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Nome da Ficha *</label>
              <input
                placeholder="Ex: Hipertrofia Avançada — Foco em Pernas"
                {...register('name')}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: 'var(--color-bg-surface)',
                  border: `1px solid ${errors.name ? '#ef4444' : 'var(--color-border-default)'}`,
                  color: 'var(--color-text-primary)',
                }}
              />
              {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Objetivo / Observações</label>
              <input
                placeholder="Ex: Ganho de massa, manutenção de força, reabilitação..."
                {...register('objetivo')}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border-default)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Nível</label>
                <select
                  {...register('dificuldade')}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-primary)' }}
                >
                  <option value="iniciante">Iniciante</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="avancado">Avançado</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Frequência (dias/semana)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  {...register('diasPorSemana', { valueAsNumber: true })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-center outline-none"
                  style={{
                    background: 'var(--color-bg-surface)',
                    border: `1px solid ${errors.diasPorSemana ? '#ef4444' : 'var(--color-border-default)'}`,
                    color: 'var(--color-text-primary)',
                  }}
                />
                {errors.diasPorSemana && <p className="text-xs text-red-400">{errors.diasPorSemana.message}</p>}
              </div>
            </div>
          </div>


          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Divisões de Treino
              </p>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)' }}>
                {divisoes.length} divisão(ões)
              </span>
            </div>
            {errors.divisoes && typeof errors.divisoes?.message === 'string' && (
              <p className="text-xs text-red-400">{errors.divisoes.message}</p>
            )}

            <AnimatePresence>
              {divisoes.map((div, divIdx) => (
                <DivisaoCard
                  key={div.id}
                  divIdx={divIdx}
                  register={register}
                  control={control}
                  errors={errors}
                  onRemoveDivisao={() => removeDivisao(divIdx)}
                  totalDivisoes={divisoes.length}
                />
              ))}
            </AnimatePresence>

            <button
              type="button"
              onClick={() =>
                addDivisao({
                  nome: '',
                  exercicios: [{ nome: '', grupoMuscular: '', series: 3, repeticoes: '10-12', segundosDescanso: 60 }],
                })
              }
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-80"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '2px dashed var(--color-border-default)',
                color: 'var(--color-text-muted)',
              }}
            >
              <Plus className="h-4 w-4" />
              Adicionar Nova Divisão / Dia de Treino
            </button>
          </div>


          {divisoes.length > 0 && (
            <div className="p-3 rounded-xl flex items-center gap-2 text-xs" style={{ background: 'var(--color-primary-muted)', border: '1px solid oklch(55% 0.28 290 / 0.2)' }}>
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
              <span style={{ color: 'var(--color-text-secondary)' }}>
                <strong style={{ color: 'var(--color-primary)' }}>{divisoes.length}</strong> divisão(ões) •{' '}
                <strong style={{ color: 'var(--color-primary)' }}>
                  {/* Não conseguimos usar useWatch facilmente aqui, então mostramos os fields */}
                  {divisoes.reduce((a, d) => a + (d.exercicios?.length || 0), 0)}
                </strong> exercício(s) no total
              </span>
            </div>
          )}


          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setFichaModal(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              carregando={isPending}
              leftIcon={<Save className="h-4 w-4" />}
            >
              {modoEditar ? 'Salvar Alterações' : 'Criar Ficha'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
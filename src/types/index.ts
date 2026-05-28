export type Perfil = 'aluno' | 'professor' | 'gerencia';

export type StatusPagamento = 'adimplente' | 'inadimplente' | 'pendente';

export type StatusEquipamento = 'funcionando' | 'manutencao' | 'quebrado';

export type TipoAlerta = 'info' | 'warning' | 'danger' | 'success';

export type DificuldadeTreino = 'iniciante' | 'intermediario' | 'avancado';

export type StatusManutencao = 'pendente' | 'aprovada' | 'rejeitada' | 'concluida';

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface Usuario {
  id: string;
  name: string;
  email: string;
  role: Perfil;
  avatarUrl?: string;
  phone?: string;
  cpf?: string;
  criadoEm: string;
}

export interface EstadoAutenticacao {
  user: Usuario | null;
  estaAutenticado: boolean;
  carregando: boolean;
}

export interface Exercicio {
  id: string;
  name: string;
  grupoMuscular: string;
  sets: number;
  reps: string;
  segundosDescanso: number;
  pesoKg?: number;
  notes?: string;
  videoUrl?: string;
  seriesConcluidas?: number;
}

export interface PlanoTreino {
  id: string;
  name: string;
  alunoId: string;
  professorId: string;
  dificuldade: DificuldadeTreino;
  diasPorSemana: number;
  exercicios: Exercicio[];
  criadoEm: string;
  atualizadoEm: string;
  ativo: boolean;
}

export interface SessaoTreino {
  id: string;
  alunoId: string;
  planoTreinoId: string;
  iniciadoEm: string;
  concluidoEm?: string;
  exerciciosConcluidos: string[];
}

export interface Aluno {
  id: string;
  usuarioId: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  avatarUrl?: string;
  statusPagamento: StatusPagamento;
  mensalidade: number;
  diaVencimento: number;
  matriculadoEm: string;
  ultimoPagamentoEm?: string;
  planoTreinoAtivoId?: string;
  professorId: string;
  contatoEmergencia?: string;
  observacoesMedicas?: string;
}

export interface Equipamento {
  id: string;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  numeroSerie?: string;
  status: StatusEquipamento;
  location: string;
  ultimaManutencaoEm?: string;
  proximaManutencaoEm?: string;
  compradoEm?: string;
  notes?: string;
  imagemUrl?: string;
}

export interface AlertaAcademia {
  id: string;
  title: string;
  message: string;
  type: TipoAlerta;
  perfilAlvo: Perfil | 'todos';
  autorId: string;
  nomeAutor: string;
  criadoEm: string;
  expiraEm?: string;
  lido?: boolean;
}


export interface SolicitacaoManutencao {
  id: string;
  equipamentoId: string;
  nomeEquipamento: string;
  solicitadoPorId: string;
  nomeSolicitante: string;
  description: string;
  priority: 'baixa' | 'media' | 'alta';
  status: StatusManutencao;
  custoEstimadoBRL?: number;
  aprovadoPorId?: string;
  criadoEm: string;
  resolvidoEm?: string;
  notes?: string;
}

export interface ResumoFinanceiro {
  totalAlunos: number;
  adimplentes: number;
  inadimplentes: number;
  pendentes: number;
  receitaMensalBRL: number;
  receitaEsperadaBRL: number;
  taxaInadimplenciaPercentual: number;
}

export interface PontoReceita {
  month: string;
  receita: number;
  esperado: number;
  inadimplencia: number;
}

export interface KpiGerencia {
  totalAlunos: number;
  alunosAtivos: number;
  novosAlunosEsteMes: number;
  cancelamentosEsteMes: number;
  totalEquipamentos: number;
  problemasEquipamento: number;
  manutencoesPendentes: number;
  receitaMensalBRL: number;
  taxaInadimplenciaPercentual: number;
  frequenciaMediaPorDia: number;
}

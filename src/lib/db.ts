import { createClient, type Client } from '@libsql/client';

export const db: Client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:gympro.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});


export async function inicializarSchema(): Promise<void> {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL, avatarUrl TEXT, phone TEXT, cpf TEXT, criadoEm TEXT NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS credenciais (
        email TEXT PRIMARY KEY, password TEXT NOT NULL, usuarioId TEXT NOT NULL,
        FOREIGN KEY(usuarioId) REFERENCES usuarios(id)
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS alunos (
        id TEXT PRIMARY KEY, usuarioId TEXT NOT NULL, name TEXT NOT NULL,
        email TEXT NOT NULL, phone TEXT NOT NULL, cpf TEXT NOT NULL,
        avatarUrl TEXT, statusPagamento TEXT NOT NULL,
        mensalidade REAL NOT NULL, diaVencimento INTEGER NOT NULL,
        matriculadoEm TEXT NOT NULL, ultimoPagamentoEm TEXT,
        planoTreinoAtivoId TEXT, professorId TEXT,
        contatoEmergencia TEXT, observacoesMedicas TEXT,
        solicitacaoProfessorId TEXT, nomeProfessorSolicitante TEXT,
        streak INTEGER DEFAULT 0, treinosMes INTEGER DEFAULT 0,
        ultimoTreinoEm TEXT,
        solicitacaoFichaEm TEXT, tipoSolicitacaoFicha TEXT,
        FOREIGN KEY(usuarioId) REFERENCES usuarios(id)
      );
    `);

    // Migrações: adicionar colunas de solicitação de ficha em bancos já existentes
    try {
      await db.execute(`ALTER TABLE alunos ADD COLUMN solicitacaoFichaEm TEXT`);
    } catch (_) { /* coluna já existe */ }
    try {
      await db.execute(`ALTER TABLE alunos ADD COLUMN tipoSolicitacaoFicha TEXT`);
    } catch (_) { /* coluna já existe */ }

    await db.execute(`
      CREATE TABLE IF NOT EXISTS planos_treino (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, alunoId TEXT NOT NULL, professorId TEXT NOT NULL,
        dificuldade TEXT NOT NULL, diasPorSemana INTEGER NOT NULL,
        objetivo TEXT, exercicios TEXT NOT NULL DEFAULT '[]',
        criadoEm TEXT NOT NULL, atualizadoEm TEXT NOT NULL, ativo INTEGER NOT NULL
      );
    `);

    // Migrações em planos_treino existentes
    try { await db.execute(`ALTER TABLE planos_treino ADD COLUMN objetivo TEXT`); } catch (_) { }

    // ── Divisões de Treino (Nível 2) ──────────────────────────────────────────
    await db.execute(`
      CREATE TABLE IF NOT EXISTS divisoes_treino (
        id TEXT PRIMARY KEY,
        planoId TEXT NOT NULL,
        nome TEXT NOT NULL,
        ordem INTEGER NOT NULL DEFAULT 0,
        criadoEm TEXT NOT NULL,
        FOREIGN KEY(planoId) REFERENCES planos_treino(id)
      );
    `);

    // ── Exercícios da Divisão (Nível 3) ─────────────────────────────────────
    await db.execute(`
      CREATE TABLE IF NOT EXISTS exercicios_divisao (
        id TEXT PRIMARY KEY,
        divisaoId TEXT NOT NULL,
        nome TEXT NOT NULL,
        grupoMuscular TEXT NOT NULL,
        equipamentoId TEXT,
        series INTEGER NOT NULL DEFAULT 3,
        repeticoes TEXT NOT NULL DEFAULT '10-12',
        pesoKg REAL,
        segundosDescanso INTEGER NOT NULL DEFAULT 60,
        observacoes TEXT,
        ordem INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY(divisaoId) REFERENCES divisoes_treino(id)
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS sessoes_treino (
        id TEXT PRIMARY KEY, alunoId TEXT NOT NULL, planoTreinoId TEXT NOT NULL,
        iniciadoEm TEXT NOT NULL, concluidoEm TEXT, exerciciosConcluidos TEXT NOT NULL,
        FOREIGN KEY(alunoId) REFERENCES alunos(id),
        FOREIGN KEY(planoTreinoId) REFERENCES planos_treino(id)
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS equipamentos (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, brand TEXT,
        model TEXT, numeroSerie TEXT, status TEXT NOT NULL, location TEXT NOT NULL,
        ultimaManutencaoEm TEXT, proximaManutencaoEm TEXT, compradoEm TEXT, notes TEXT, imagemUrl TEXT,
        deletedAt TEXT
      );
    `);

    // Migração: adicionar deletedAt em bancos de dados já existentes
    try {
      await db.execute(`ALTER TABLE equipamentos ADD COLUMN deletedAt TEXT`);
    } catch (_) { /* coluna já existe */ }

    await db.execute(`
      CREATE TABLE IF NOT EXISTS alertas (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, message TEXT NOT NULL, type TEXT NOT NULL,
        perfilAlvo TEXT NOT NULL, autorId TEXT NOT NULL, nomeAutor TEXT NOT NULL,
        criadoEm TEXT NOT NULL, expiraEm TEXT, lido INTEGER NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS solicitacoes_manutencao (
        id TEXT PRIMARY KEY, equipamentoId TEXT NOT NULL, nomeEquipamento TEXT NOT NULL,
        solicitadoPorId TEXT NOT NULL, nomeSolicitante TEXT NOT NULL, description TEXT NOT NULL,
        priority TEXT NOT NULL, urgencyLevel TEXT, status TEXT NOT NULL, custoEstimadoBRL REAL,
        aprovadoPorId TEXT, criadoEm TEXT NOT NULL, resolvidoEm TEXT, notes TEXT,
        FOREIGN KEY(equipamentoId) REFERENCES equipamentos(id)
      );
    `);

    // Migração: adicionar urgencyLevel em solicitacoes_manutencao já existentes
    try {
      await db.execute(`ALTER TABLE solicitacoes_manutencao ADD COLUMN urgencyLevel TEXT`);
    } catch (_) { /* coluna já existe */ }

  } catch (error) {
    console.error('Failure executing schema migrations or seeding:', error);
    throw error;
  }
}

inicializarSchema().catch((error) => {
  console.error('Falha crítica na inicialização automática do banco de dados:', error);
});
import { createClient, type Client } from '@libsql/client';

// Cliente único inicializado de forma segura para o ecossistema do Next.js
export const db: Client = createClient({
  url: 'file:gympro.db',
});

/**
 * Executa as migrações estruturais do banco de dados de forma assíncrona e segura.
 * Responsabilidade Única: Garantir a integridade do Schema DDL e disparar a semente de dados.
 */
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
        id TEXT PRIMARY KEY, usuarioId TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL,
        phone TEXT NOT NULL, cpf TEXT NOT NULL, statusPagamento TEXT NOT NULL,
        mensalidade REAL NOT NULL, diaVencimento INTEGER NOT NULL, matriculadoEm TEXT NOT NULL,
        ultimoPagamentoEm TEXT, planoTreinoAtivoId TEXT, professorId TEXT,
        contatoEmergencia TEXT, observacoesMedicas TEXT,
        solicitacaoProfessorId TEXT, nomeProfessorSolicitante TEXT,
        FOREIGN KEY(usuarioId) REFERENCES usuarios(id)
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS planos_treino (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, alunoId TEXT NOT NULL, professorId TEXT NOT NULL,
        dificuldade TEXT NOT NULL, diasPorSemana INTEGER NOT NULL, exercicios TEXT NOT NULL,
        criadoEm TEXT NOT NULL, atualizadoEm TEXT NOT NULL, ativo INTEGER NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS equipamentos (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, brand TEXT,
        model TEXT, numeroSerie TEXT, status TEXT NOT NULL, location TEXT NOT NULL,
        ultimaManutencaoEm TEXT, proximaManutencaoEm TEXT, compradoEm TEXT, notes TEXT, imagemUrl TEXT
      );
    `);

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
        priority TEXT NOT NULL, status TEXT NOT NULL, custoEstimadoBRL REAL,
        aprovadoPorId TEXT, criadoEm TEXT NOT NULL, resolvidoEm TEXT, notes TEXT,
        FOREIGN KEY(equipamentoId) REFERENCES equipamentos(id)
      );
    `);

  } catch (error) {
    console.error('Failure executing schema migrations or seeding:', error);
    throw error;
  }
}

// Gatilho de inicialização assíncrona automática executado na carga do módulo
inicializarSchema().catch((error) => {
  console.error('Falha crítica na inicialização automática do banco de dados:', error);
});
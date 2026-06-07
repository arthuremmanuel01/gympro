import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';
import type { PlanoTreinoCompleto, DivisaoTreino, ExercicioDivisao } from '@/types';


function mapRowToExercicio(row: Record<string, unknown>): ExercicioDivisao {
  return {
    id: String(row.id),
    divisaoId: String(row.divisaoId),
    nome: String(row.nome),
    grupoMuscular: String(row.grupoMuscular),
    equipamentoId: row.equipamentoId ? String(row.equipamentoId) : null,
    series: Number(row.series),
    repeticoes: String(row.repeticoes),
    pesoKg: row.pesoKg != null ? Number(row.pesoKg) : null,
    segundosDescanso: Number(row.segundosDescanso),
    observacoes: row.observacoes ? String(row.observacoes) : null,
    ordem: Number(row.ordem),
    seriesConcluidas: 0,
  };
}

async function fetchPlanoCompleto(planoId: string): Promise<PlanoTreinoCompleto | null> {
  const planoResult = await db.execute({
    sql: 'SELECT * FROM planos_treino WHERE id = ? LIMIT 1',
    args: [planoId],
  });
  const planoRow = planoResult.rows[0];
  if (!planoRow) return null;

  const divisoesResult = await db.execute({
    sql: 'SELECT * FROM divisoes_treino WHERE planoId = ? ORDER BY ordem ASC',
    args: [planoId],
  });

  const divisoes: DivisaoTreino[] = await Promise.all(
    divisoesResult.rows.map(async (divRow) => {
      const exResult = await db.execute({
        sql: 'SELECT * FROM exercicios_divisao WHERE divisaoId = ? ORDER BY ordem ASC',
        args: [String(divRow.id)],
      });
      return {
        id: String(divRow.id),
        planoId: String(divRow.planoId),
        nome: String(divRow.nome),
        ordem: Number(divRow.ordem),
        criadoEm: String(divRow.criadoEm),
        exercicios: exResult.rows.map((r) => mapRowToExercicio(r as Record<string, unknown>)),
      };
    })
  );

  return {
    id: String(planoRow.id),
    name: String(planoRow.name),
    alunoId: String(planoRow.alunoId),
    professorId: String(planoRow.professorId),
    dificuldade: planoRow.dificuldade as PlanoTreinoCompleto['dificuldade'],
    diasPorSemana: Number(planoRow.diasPorSemana),
    objetivo: planoRow.objetivo ? String(planoRow.objetivo) : null,
    criadoEm: String(planoRow.criadoEm),
    atualizadoEm: String(planoRow.atualizadoEm),
    ativo: planoRow.ativo === 1,
    divisoes,
  };
}


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const professorId = searchParams.get('professorId');

  // Retorna alunos distintos vinculados ao professor que está acessando o painel
  if (professorId) {
    try {
      const result = await db.execute({
        sql: `SELECT DISTINCT a.* FROM alunos a
              INNER JOIN planos_treino p ON p.alunoId = a.id
              WHERE p.professorId = ?`,
        args: [professorId],
      });
      return NextResponse.json(result.rows);
    } catch {
      return NextResponse.json({ error: 'Erro ao buscar alunos do professor.' }, { status: 500 });
    }
  }

  if (!id) {
    return NextResponse.json({ error: 'O ID do plano é obrigatório.' }, { status: 400 });
  }

  try {
    const plano = await fetchPlanoCompleto(id);
    return NextResponse.json(plano);
  } catch (error) {
    console.error('Erro ao buscar plano de treino:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar plano de treino.' }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id: planoIdParam, name, alunoId, professorId, dificuldade, diasPorSemana, objetivo, divisoes, ativo } = body;

    if (!name || !alunoId || !professorId) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 });
    }

    const planoId = planoIdParam || randomUUID();
    const now = new Date().toISOString();
    const ativoInt = ativo !== false ? 1 : 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const statements: { sql: string; args: any[] }[] = [];

    statements.push({
      sql: `INSERT INTO planos_treino
              (id, name, alunoId, professorId, dificuldade, diasPorSemana, objetivo, exercicios, criadoEm, atualizadoEm, ativo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [planoId, name, alunoId, professorId, dificuldade || 'iniciante', Number(diasPorSemana || 3), objetivo || null, '[]', now, now, ativoInt],
    });

    // O aluno passa a ter esta ficha como ativa automaticamente ao ser criada
    statements.push({
      sql: 'UPDATE alunos SET planoTreinoAtivoId = ? WHERE id = ?',
      args: [planoId, alunoId],
    });

    // Limpa qualquer solicitação de ficha pendente na fila do aluno
    statements.push({
      sql: 'UPDATE alunos SET solicitacaoFichaEm = NULL, tipoSolicitacaoFicha = NULL WHERE id = ?',
      args: [alunoId],
    });

    if (Array.isArray(divisoes)) {
      divisoes.forEach((div: DivisaoTreino, divIdx: number) => {
        const divisaoId = randomUUID();
        statements.push({
          sql: `INSERT INTO divisoes_treino (id, planoId, nome, ordem, criadoEm)
                VALUES (?, ?, ?, ?, ?)`,
          args: [divisaoId, planoId, div.nome, divIdx, now],
        });

        if (Array.isArray(div.exercicios)) {
          div.exercicios.forEach((ex: ExercicioDivisao, exIdx: number) => {
            statements.push({
              sql: `INSERT INTO exercicios_divisao
                      (id, divisaoId, nome, grupoMuscular, equipamentoId, series, repeticoes, pesoKg, segundosDescanso, observacoes, ordem)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                randomUUID(),
                divisaoId,
                ex.nome,
                ex.grupoMuscular,
                ex.equipamentoId || null,
                Number(ex.series),
                String(ex.repeticoes),
                ex.pesoKg || null,
                Number(ex.segundosDescanso ?? 60),
                ex.observacoes || null,
                exIdx,
              ],
            });
          });
        }
      });
    }

    // A transação atômica em batch assegura que plano, divisões e exercícios
    // sejam inseridos todos juntos. Em caso de falha de validação ou restrição,
    // um rollback automático ocorre e não teremos dados parciais no banco.
    await db.batch(statements);

    const planoCompleto = await fetchPlanoCompleto(planoId);
    return NextResponse.json({ success: true, id: planoId, plano: planoCompleto });
  } catch (error) {
    console.error('Erro ao criar plano de treino:', error);
    return NextResponse.json({ error: 'Erro interno ao criar plano de treino.' }, { status: 500 });
  }
}


export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, dificuldade, diasPorSemana, objetivo, divisoes, ativo } = body;

    if (!id) {
      return NextResponse.json({ error: 'O ID do plano é obrigatório.' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const ativoInt = ativo !== false ? 1 : 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const statements: { sql: string; args: any[] }[] = [];

    statements.push({
      sql: `UPDATE planos_treino
            SET name = ?, dificuldade = ?, diasPorSemana = ?, objetivo = ?, atualizadoEm = ?, ativo = ?
            WHERE id = ?`,
      args: [name, dificuldade, Number(diasPorSemana), objetivo || null, now, ativoInt, id],
    });

    // Estratégia de Replace: deletamos tudo (divisões e exercícios) em cascata 
    // e recriamos com os novos dados enviados. Isso reduz a complexidade e bugs de sincronia comparado ao diff.
    const divisoesAntigasResult = await db.execute({
      sql: 'SELECT id FROM divisoes_treino WHERE planoId = ?',
      args: [id],
    });

    for (const divRow of divisoesAntigasResult.rows) {
      statements.push({
        sql: 'DELETE FROM exercicios_divisao WHERE divisaoId = ?',
        args: [String(divRow.id)],
      });
    }

    statements.push({
      sql: 'DELETE FROM divisoes_treino WHERE planoId = ?',
      args: [id],
    });

    const planoResult = await db.execute({
      sql: 'SELECT alunoId FROM planos_treino WHERE id = ?',
      args: [id],
    });
    const alunoId = planoResult.rows[0]?.alunoId;
    if (alunoId) {
      statements.push({
        sql: 'UPDATE alunos SET solicitacaoFichaEm = NULL, tipoSolicitacaoFicha = NULL WHERE id = ?',
        args: [alunoId],
      });
    }

    if (Array.isArray(divisoes)) {
      divisoes.forEach((div: DivisaoTreino, divIdx: number) => {
        const divisaoId = randomUUID();
        statements.push({
          sql: `INSERT INTO divisoes_treino (id, planoId, nome, ordem, criadoEm)
                VALUES (?, ?, ?, ?, ?)`,
          args: [divisaoId, id, div.nome, divIdx, now],
        });

        if (Array.isArray(div.exercicios)) {
          div.exercicios.forEach((ex: ExercicioDivisao, exIdx: number) => {
            statements.push({
              sql: `INSERT INTO exercicios_divisao
                      (id, divisaoId, nome, grupoMuscular, equipamentoId, series, repeticoes, pesoKg, segundosDescanso, observacoes, ordem)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                randomUUID(),
                divisaoId,
                ex.nome,
                ex.grupoMuscular,
                ex.equipamentoId || null,
                Number(ex.series),
                String(ex.repeticoes),
                ex.pesoKg || null,
                Number(ex.segundosDescanso ?? 60),
                ex.observacoes || null,
                exIdx,
              ],
            });
          });
        }
      });
    }

    await db.batch(statements);

    return NextResponse.json({ success: true, message: 'Plano de treino atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar plano de treino:', error);
    return NextResponse.json({ error: 'Erro interno ao atualizar plano de treino.' }, { status: 500 });
  }
}
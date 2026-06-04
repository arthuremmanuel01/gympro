import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'O ID do plano é obrigatório.' }, { status: 400 });
  }

  try {
    const result = await db.execute({
      sql: 'SELECT * FROM planos_treino WHERE id = ? LIMIT 1',
      args: [id],
    });

    const row = result.rows[0];
    if (!row) {
      return NextResponse.json(null);
    }

    const plano = {
      ...row,
      diasPorSemana: Number(row.diasPorSemana),
      ativo: row.ativo === 1,
      exercicios: JSON.parse(row.exercicios as string),
    };

    return NextResponse.json(plano);
  } catch (error) {
    console.error('Erro ao buscar plano de treino do banco:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar plano de treino.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, alunoId, professorId, dificuldade, diasPorSemana, exercicios, ativo } = body;

    if (!id || !name || !alunoId || !professorId) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes para a criação do plano.' }, { status: 400 });
    }

    const dataAtual = new Date().toISOString();
    const exerciciosJson = JSON.stringify(exercicios || []);
    const ativoInt = ativo ? 1 : 0;

    await db.execute({
      sql: `INSERT INTO planos_treino (id, name, alunoId, professorId, dificuldade, diasPorSemana, exercicios, criadoEm, atualizadoEm, ativo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, name, alunoId, professorId, dificuldade || 'iniciante', Number(diasPorSemana || 3), exerciciosJson, dataAtual, dataAtual, ativoInt],
    });

    await db.execute({
      sql: 'UPDATE alunos SET planoTreinoAtivoId = ? WHERE id = ?',
      args: [id, alunoId],
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Erro ao criar plano de treino no banco:', error);
    return NextResponse.json({ error: 'Erro interno ao criar plano de treino.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, dificuldade, diasPorSemana, exercicios, ativo } = body;

    if (!id) {
      return NextResponse.json({ error: 'O ID do plano é obrigatório.' }, { status: 400 });
    }

    const dataAtual = new Date().toISOString();
    const exerciciosJson = JSON.stringify(exercicios);
    const ativoInt = ativo ? 1 : 0;

    await db.execute({
      sql: `UPDATE planos_treino 
            SET name = ?, dificuldade = ?, diasPorSemana = ?, exercicios = ?, atualizadoEm = ?, ativo = ? 
            WHERE id = ?`,
      args: [name, dificuldade, diasPorSemana, exerciciosJson, dataAtual, ativoInt, id],
    });

    return NextResponse.json({ success: true, message: 'Plano de treino atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar plano de treino no banco:', error);
    return NextResponse.json({ error: 'Erro interno ao atualizar plano de treino.' }, { status: 500 });
  }
}
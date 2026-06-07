import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const alunoId = params.id;
    if (!alunoId) {
      return NextResponse.json({ error: 'ID do aluno não fornecido' }, { status: 400 });
    }


    const alunoResult = await db.execute({
      sql: 'SELECT usuarioId FROM alunos WHERE id = ?',
      args: [alunoId],
    });

    if (alunoResult.rows.length === 0) {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 });
    }

    const usuarioId = String(alunoResult.rows[0].usuarioId);

    // Exclusão em cascata manual (db.batch) necessária pois SQLite/LibSQL 
    // frequentemente roda com PRAGMA foreign_keys = OFF em ambientes serverless.
    await db.batch([
      {
        sql: `
          DELETE FROM exercicios_divisao 
          WHERE divisaoId IN (
            SELECT id FROM divisoes_treino 
            WHERE planoId IN (
              SELECT id FROM planos_treino WHERE alunoId = ?
            )
          )
        `,
        args: [alunoId],
      },
      {
        sql: `
          DELETE FROM divisoes_treino 
          WHERE planoId IN (
            SELECT id FROM planos_treino WHERE alunoId = ?
          )
        `,
        args: [alunoId],
      },
      {
        sql: 'DELETE FROM sessoes_treino WHERE alunoId = ?',
        args: [alunoId],
      },
      {
        sql: 'DELETE FROM planos_treino WHERE alunoId = ?',
        args: [alunoId],
      },
      {
        sql: 'DELETE FROM alunos WHERE id = ?',
        args: [alunoId],
      },
      {
        sql: 'DELETE FROM credenciais WHERE usuarioId = ?',
        args: [usuarioId],
      },
      {
        sql: 'DELETE FROM usuarios WHERE id = ?',
        args: [usuarioId],
      },
    ], 'write');

    return NextResponse.json({ success: true, message: 'Conta de aluno excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir aluno em cascata:', error);
    return NextResponse.json({ error: 'Erro interno ao excluir conta' }, { status: 500 });
  }
}

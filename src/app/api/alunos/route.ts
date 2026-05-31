import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const professorId = searchParams.get('professorId');

  try {
    let result;
    if (professorId) {
      result = await db.execute({
        sql: 'SELECT * FROM alunos WHERE professorId = ?',
        args: [professorId],
      });
    } else {
      result = await db.execute('SELECT * FROM alunos');
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar alunos' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'O ID do aluno e o novo status são obrigatórios.' }, { status: 400 });
    }

    const dataAtual = new Date().toISOString();

    if (status === 'adimplente') {
      await db.execute({
        sql: 'UPDATE alunos SET statusPagamento = ?, ultimoPagamentoEm = ? WHERE id = ?',
        args: [status, dataAtual, id],
      });
    } else {
      await db.execute({
        sql: 'UPDATE alunos SET statusPagamento = ? WHERE id = ?',
        args: [status, id],
      });
    }

    return NextResponse.json({ success: true, message: 'Status financeiro atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar status do aluno:', error);
    return NextResponse.json({ error: 'Erro interno ao processar a regularização.' }, { status: 500 });
  }
}
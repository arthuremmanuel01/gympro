import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const professorId = searchParams.get('professorId');
  const cpf = searchParams.get('cpf');
  const usuarioId = searchParams.get('usuarioId');

  try {
    if (id) {
      const result = await db.execute({
        sql: 'SELECT * FROM alunos WHERE id = ? LIMIT 1',
        args: [id],
      });
      return NextResponse.json(result.rows[0] || null);
    }

    if (cpf) {
      const result = await db.execute({
        sql: 'SELECT * FROM alunos WHERE cpf = ? LIMIT 1',
        args: [cpf],
      });
      return NextResponse.json(result.rows[0] || null);
    }

    if (usuarioId) {
      const result = await db.execute({
        sql: 'SELECT * FROM alunos WHERE usuarioId = ? LIMIT 1',
        args: [usuarioId],
      });
      return NextResponse.json(result.rows[0] || null);
    }

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
    const { id, status, action, professorId, professorName } = body;

    if (!id) {
      return NextResponse.json({ error: 'O ID do aluno é obrigatório.' }, { status: 400 });
    }

    // Gerenciamento de vínculos entre Professor e Aluno
    if (action) {
      if (action === 'solicitar') {
        if (!professorId || !professorName) {
          return NextResponse.json({ error: 'Dados do professor são obrigatórios para solicitação.' }, { status: 400 });
        }
        const check = await db.execute({
          sql: 'SELECT professorId, solicitacaoProfessorId FROM alunos WHERE id = ?',
          args: [id],
        });
        const atual = check.rows[0] as any;
        if (atual?.professorId && atual.professorId !== '') {
          return NextResponse.json({ error: 'Este aluno já possui um professor vinculado.' }, { status: 400 });
        }
        if (atual?.solicitacaoProfessorId) {
          return NextResponse.json({ error: 'Este aluno já possui uma solicitação pendente.' }, { status: 400 });
        }

        await db.execute({
          sql: 'UPDATE alunos SET solicitacaoProfessorId = ?, nomeProfessorSolicitante = ? WHERE id = ?',
          args: [professorId, professorName, id],
        });
        return NextResponse.json({ success: true, message: 'Solicitação enviada com sucesso.' });
      }

      if (action === 'aceitar') {
        await db.execute({
          sql: 'UPDATE alunos SET professorId = solicitacaoProfessorId, solicitacaoProfessorId = NULL, nomeProfessorSolicitante = NULL WHERE id = ?',
          args: [id],
        });
        return NextResponse.json({ success: true, message: 'Solicitação aceita com sucesso.' });
      }

      if (action === 'recusar') {
        await db.execute({
          sql: 'UPDATE alunos SET solicitacaoProfessorId = NULL, nomeProfessorSolicitante = NULL WHERE id = ?',
          args: [id],
        });
        return NextResponse.json({ success: true, message: 'Solicitação recusada com sucesso.' });
      }

      if (action === 'remover') {
        await db.execute({
          sql: 'UPDATE alunos SET professorId = NULL, planoTreinoAtivoId = NULL WHERE id = ?',
          args: [id],
        });
        return NextResponse.json({ success: true, message: 'Vínculo removido com sucesso.' });
      }

      return NextResponse.json({ error: 'Ação de vínculo inválida.' }, { status: 400 });
    }

    // atualização de pagamento
    if (!status) {
      return NextResponse.json({ error: 'O novo status é obrigatório.' }, { status: 400 });
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

    return NextResponse.json({ success: true, message: 'Status financeiro updated.' });
  } catch (error) {
    console.error('Erro ao atualizar status/vínculo do aluno:', error);
    return NextResponse.json({ error: 'Erro interno ao processar a requisição.' }, { status: 500 });
  }
}
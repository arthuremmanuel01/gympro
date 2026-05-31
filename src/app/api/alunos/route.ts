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
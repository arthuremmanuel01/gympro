import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM solicitacoes_manutencao ORDER BY criadoEm DESC',
      args: []
    });
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao listar manutenções' }, { status: 500 });
  }
}
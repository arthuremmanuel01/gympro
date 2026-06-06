import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await db.execute({
      sql: 'DELETE FROM equipamentos WHERE id = ?',
      args: [params.id]
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao remover equipamento' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { NextRequest } from 'next/server';

export async function GET() {
  try {
    const result = await db.execute('SELECT * FROM alertas ORDER BY criadoEm DESC');
    
    const alertas = result.rows.map((row: any) => ({
      ...row,
      lido: Boolean(row.lido),
    }));

    return NextResponse.json(alertas);
  } catch (error) {
    console.error('Erro ao buscar alertas:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar alertas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = `alert-${Date.now()}`;
    const criadoEm = new Date().toISOString();
    
    const lido = body.lido ? 1 : 0; 

    await db.execute({
      sql: `INSERT INTO alertas (id, title, message, type, perfilAlvo, autorId, nomeAutor, criadoEm, expiraEm, lido)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, 
        body.title, 
        body.message, 
        body.type, 
        body.perfilAlvo, 
        body.autorId, 
        body.nomeAutor, 
        criadoEm, 
        null, 
        lido
      ],
    });

    return NextResponse.json({ success: true, id, criadoEm });
  } catch (error) {
    console.error('Erro ao criar alerta:', error);
    return NextResponse.json({ error: 'Erro interno ao criar alerta' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.action === 'mark_all') {
      await db.execute('UPDATE alertas SET lido = 1');
    } else if (body.id) {
      await db.execute({
        sql: 'UPDATE alertas SET lido = 1 WHERE id = ?',
        args: [body.id],
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar alertas:', error);
    return NextResponse.json({ error: 'Erro interno ao atualizar alertas' }, { status: 500 });
  }
}
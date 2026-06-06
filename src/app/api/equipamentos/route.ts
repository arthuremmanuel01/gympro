import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const { rows } = await db.execute('SELECT * FROM equipamentos');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar equipamentos' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = randomUUID();
    const compradoEm = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO equipamentos (
        id, name, category, brand, model, numeroSerie, status, location,
        ultimaManutencaoEm, proximaManutencaoEm, compradoEm, notes, imagemUrl
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, 
        body.name, 
        body.category, 
        body.brand || null, 
        body.model || null,
        body.numeroSerie || null, 
        'funcionando',
        body.location, 
        null, 
        null,
        compradoEm, 
        body.notes || null, 
        body.imagemUrl || null
      ]
    });

    return NextResponse.json({ id, ...body, status: 'funcionando', compradoEm });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao adicionar equipamento' }, { status: 500 });
  }
}
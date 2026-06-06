import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    await db.execute({
      sql: 'DELETE FROM equipamentos WHERE id = ?',
      args: [id]
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao remover equipamento' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, notes } = body;

    if (status === 'manutencao') {
      await db.execute({
        sql: `UPDATE equipamentos 
              SET status = ?, notes = ?, ultimaManutencaoEm = ? 
              WHERE id = ?`,
        args: [status, notes || null, new Date().toISOString(), id]
      });
    } else if (status === 'quebrado') {
      await db.execute({
        sql: `UPDATE equipamentos 
              SET status = ?, notes = ? 
              WHERE id = ?`,
        args: [status, notes || null, id]
      });

      const equipmentResult = await db.execute({
        sql: 'SELECT name FROM equipamentos WHERE id = ?',
        args: [id]
      });
      const nomeEquipamento = equipmentResult.rows[0]?.name?.toString() || 'Equipamento';

      const manutencaoId = randomUUID();
      await db.execute({
        sql: `INSERT INTO solicitacoes_manutencao (
                id, equipamentoId, nomeEquipamento, solicitadoPorId, nomeSolicitante, 
                description, priority, status, custoEstimadoBRL, aprovadoPorId, 
                criadoEm, resolvidoEm, notes
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          manutencaoId,
          id,
          nomeEquipamento,
          'sistema-professor',
          'Interface do Professor',
          notes || 'Equipamento reportado como quebrado pelo professor.',
          'alta',
          'pendente',
          null,
          null,
          new Date().toISOString(),
          null,
          null
        ]
      });
    } else {
      await db.execute({
        sql: `UPDATE equipamentos 
              SET status = ?, notes = ? 
              WHERE id = ?`,
        args: [status, notes || null, id]
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar status do equipamento' }, { status: 500 });
  }
}
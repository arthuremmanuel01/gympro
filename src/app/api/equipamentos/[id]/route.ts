import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Soft Delete: evita violação de FK com solicitacoes_manutencao
    await db.execute({
      sql: 'UPDATE equipamentos SET deletedAt = ? WHERE id = ?',
      args: [new Date().toISOString(), id]
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover equipamento:', error);
    return NextResponse.json({ error: 'Erro ao remover equipamento' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, notes, urgencyLevel } = body;

    if (status === 'manutencao') {
      return NextResponse.json({ error: 'Operação não permitida. O status em manutenção só pode ser definido via aprovação do gestor.' }, { status: 403 });
    }

    if (status === 'quebrado') {
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

      // Mapeia o nível de urgência para o campo priority legado
      const priorityMap: Record<string, string> = {
        baixa: 'baixa',
        media: 'media',
        alta: 'alta',
      };
      const priority = urgencyLevel ? (priorityMap[urgencyLevel] ?? 'alta') : 'alta';

      const manutencaoId = randomUUID();
      await db.execute({
        sql: `INSERT INTO solicitacoes_manutencao (
                id, equipamentoId, nomeEquipamento, solicitadoPorId, nomeSolicitante, 
                description, priority, urgencyLevel, status, custoEstimadoBRL, aprovadoPorId, 
                criadoEm, resolvidoEm, notes
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          manutencaoId,
          id,
          nomeEquipamento,
          'sistema-professor',
          'Interface do Professor',
          notes || 'Equipamento reportado como quebrado pelo professor.',
          priority,
          urgencyLevel || 'alta',
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
    console.error('Erro ao atualizar equipamento:', error);
    return NextResponse.json({ error: 'Erro ao atualizar status do equipamento' }, { status: 500 });
  }
}
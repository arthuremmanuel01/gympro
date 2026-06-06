import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, notes } = body;

    await db.execute({
      sql: `UPDATE solicitacoes_manutencao 
            SET status = ?, notes = COALESCE(?, notes), resolvidoEm = ?
            WHERE id = ?`,
      args: [
        status,
        notes || null,
        status === 'concluida' || status === 'rejeitada' ? new Date().toISOString() : null,
        id
      ]
    });

    const solicitacaoResult = await db.execute({
      sql: 'SELECT equipamentoId FROM solicitacoes_manutencao WHERE id = ?',
      args: [id]
    });
    
    const equipamentoId = solicitacaoResult.rows[0]?.equipamentoId?.toString();

    if (equipamentoId) {
      let proximoStatusEquipamento: string | null = null;

      if (status === 'aprovada') {
        proximoStatusEquipamento = 'manutencao';
      } else if (status === 'concluida' || status === 'rejeitada') {
        proximoStatusEquipamento = 'funcionando';
      }

      if (proximoStatusEquipamento) {
        await db.execute({
          sql: 'UPDATE equipamentos SET status = ? WHERE id = ?',
          args: [proximoStatusEquipamento, equipamentoId]
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao processar e sincronizar alteração de manutenção' }, { status: 500 });
  }
}
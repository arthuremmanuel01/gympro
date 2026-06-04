import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { alunoId, planoTreinoId, exerciciosConcluidos } = body;

    if (!alunoId || !planoTreinoId) {
      return NextResponse.json(
        { error: 'alunoId e planoTreinoId são obrigatórios.' },
        { status: 400 }
      );
    }

    const alunoResult = await db.execute({
      sql: 'SELECT streak, treinosMes, ultimoTreinoEm FROM alunos WHERE id = ? LIMIT 1',
      args: [alunoId],
    });

    if (alunoResult.rows.length === 0) {
      return NextResponse.json({ error: 'Aluno não encontrado.' }, { status: 404 });
    }

    const alunoRow = alunoResult.rows[0];
    const hoje = new Date();
    const hojeStr = hoje.toISOString();
    
    let streak = Number(alunoRow.streak || 0);
    let treinosMes = Number(alunoRow.treinosMes || 0);
    const ultimoTreinoEm = alunoRow.ultimoTreinoEm 
      ? new Date(alunoRow.ultimoTreinoEm as string) 
      : null;

    if (ultimoTreinoEm) {
      const dataHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
      const dataUltimo = new Date(ultimoTreinoEm.getFullYear(), ultimoTreinoEm.getMonth(), ultimoTreinoEm.getDate());
      
      const diffTempo = dataHoje.getTime() - dataUltimo.getTime();
      const diffDias = Math.floor(diffTempo / (1000 * 3600 * 24));
      
      if (diffDias === 1) {
        streak += 1; 
      } else if (diffDias > 1) {
        streak = 1; 
      } 

      // Validação de Mês
      if (hoje.getMonth() === ultimoTreinoEm.getMonth() && hoje.getFullYear() === ultimoTreinoEm.getFullYear()) {
        if (diffDias !== 0) treinosMes += 1; 
      } else {
        treinosMes = 1; // Virou o mês
      }
    } else {
      streak = 1;
      treinosMes = 1;
    }

    const sessaoId = crypto.randomUUID();
    const exerciciosJson = JSON.stringify(exerciciosConcluidos || []);

    // Persistência de Dados
    await db.execute({
      sql: `INSERT INTO sessoes_treino (id, alunoId, planoTreinoId, iniciadoEm, concluidoEm, exerciciosConcluidos)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [sessaoId, alunoId, planoTreinoId, hojeStr, hojeStr, exerciciosJson],
    });

    await db.execute({
      sql: `UPDATE alunos SET streak = ?, treinosMes = ?, ultimoTreinoEm = ? WHERE id = ?`,
      args: [streak, treinosMes, hojeStr, alunoId],
    });

    return NextResponse.json({ success: true, streak, treinosMes });
  } catch (error) {
    console.error('Erro ao concluir treino no banco:', error);
    return NextResponse.json(
      { error: 'Erro interno ao concluir treino.' },
      { status: 500 }
    );
  }
}
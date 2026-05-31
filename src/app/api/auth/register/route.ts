import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, phone, cpf } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, error: 'Todos os campos são obrigatórios.' }, { status: 400 });
    }

    if (role === 'aluno' && (!phone || !cpf)) {
      return NextResponse.json({ success: false, error: 'Telefone e CPF são obrigatórios para alunos.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();

    // Validar se o e-mail já existe
    const checkResult = await db.execute({
      sql: 'SELECT email FROM credenciais WHERE LOWER(email) = ? LIMIT 1;',
      args: [normalizedEmail],
    });

    if (checkResult.rows.length > 0) {
      return NextResponse.json({ success: false, error: 'Este e-mail já está em uso.' }, { status: 409 });
    }

    // Validar se o CPF já está em uso para perfil aluno
    if (role === 'aluno' && cpf) {
      const checkCpf = await db.execute({
        sql: 'SELECT id FROM alunos WHERE cpf = ? LIMIT 1;',
        args: [cpf],
      });

      if (checkCpf.rows.length > 0) {
        return NextResponse.json({ success: false, error: 'Este CPF já está cadastrado.' }, { status: 409 });
      }
    }

    const userId = crypto.randomUUID();
    const criadoEm = new Date().toISOString();

    // Persistir o usuário base preenchendo phone e cpf se disponíveis
    await db.execute({
      sql: 'INSERT INTO usuarios (id, name, email, role, phone, cpf, criadoEm) VALUES (?, ?, ?, ?, ?, ?, ?);',
      args: [userId, name, normalizedEmail, role, phone || null, cpf || null, criadoEm],
    });

    // Persistir a credencial atrelada
    await db.execute({
      sql: 'INSERT INTO credenciais (email, password, usuarioId) VALUES (?, ?, ?);',
      args: [normalizedEmail, password, userId],
    });

    // Vínculo automático e seguro com a tabela de alunos respeitando campos obrigatórios reais
    if (role === 'aluno') {
      const alunoId = `aluno-${crypto.randomUUID()}`;
      await db.execute({
        sql: `INSERT INTO alunos (
          id, usuarioId, name, email, phone, cpf, 
          statusPagamento, mensalidade, diaVencimento, 
          matriculadoEm, professorId
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [
          alunoId,
          userId,
          name,
          normalizedEmail,
          phone,
          cpf,
          'pendente',  
          120.0,       
          5,           
          criadoEm,    
          ''           
        ],
      });
    }

    return NextResponse.json({ success: true, message: 'Conta criada com sucesso.' });
  } catch (error) {
    console.error('Erro crítico no endpoint de cadastro:', error);
    return NextResponse.json({ success: false, error: 'Falha interna no servidor ao registrar usuário.' }, { status: 500 });
  }
}
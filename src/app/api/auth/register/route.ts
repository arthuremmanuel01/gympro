import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, error: 'Todos os campos são obrigatórios.' }, { status: 400 });
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

    const userId = crypto.randomUUID();
    const criadoEm = new Date().toISOString();

    // Persistir o usuário base
    await db.execute({
      sql: 'INSERT INTO usuarios (id, name, email, role, criadoEm) VALUES (?, ?, ?, ?, ?);',
      args: [userId, name, normalizedEmail, role, criadoEm],
    });

    // Persistir a credencial atrelada
    await db.execute({
      sql: 'INSERT INTO credenciais (email, password, usuarioId) VALUES (?, ?, ?);',
      args: [normalizedEmail, password, userId],
    });

    return NextResponse.json({ success: true, message: 'Conta criada com sucesso.' });
  } catch (error) {
    console.error('Erro crítico no endpoint de cadastro:', error);
    return NextResponse.json({ success: false, error: 'Falha interna no servidor ao registrar usuário.' }, { status: 500 });
  }
}
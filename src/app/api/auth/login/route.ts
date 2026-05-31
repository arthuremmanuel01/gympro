// src\app\api\auth\login\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Usuario } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    // Fluxo 1: Login rápido por Perfil (Mecanismo "loginAsRole")
    if (role) {
      const result = await db.execute({
        sql: 'SELECT * FROM usuarios WHERE role = ? LIMIT 1;',
        args: [role],
      });

      if (result.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Nenhum usuário localizado com este perfil.' }, { status: 404 });
      }

      const row = result.rows[0];
      const user: Usuario = {
        id: String(row.id),
        name: String(row.name),
        email: String(row.email),
        role: row.role as any,
        avatarUrl: row.avatarUrl ? String(row.avatarUrl) : undefined,
        phone: row.phone ? String(row.phone) : undefined,
        cpf: row.cpf ? String(row.cpf) : undefined,
        criadoEm: String(row.criadoEm),
      };

      return NextResponse.json({ success: true, user });
    }

    // Fluxo 2: Autenticação padrão por e-mail e senha
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'E-mail e senha são obrigatórios.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();
    const credResult = await db.execute({
      sql: 'SELECT * FROM credenciais WHERE LOWER(email) = ? LIMIT 1;',
      args: [normalizedEmail],
    });

    if (credResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'E-mail ou senha incorretos.' }, { status: 401 });
    }

    const credential = credResult.rows[0];
    if (String(credential.password) !== String(password)) {
      return NextResponse.json({ success: false, error: 'E-mail ou senha incorretos.' }, { status: 401 });
    }

    const userResult = await db.execute({
      sql: 'SELECT * FROM usuarios WHERE id = ? LIMIT 1;',
      args: [credential.usuarioId],
    });

    if (userResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Usuário não encontrado no sistema.' }, { status: 404 });
    }

    const userRow = userResult.rows[0];
    const user: Usuario = {
      id: String(userRow.id),
      name: String(userRow.name),
      email: String(userRow.email),
      role: userRow.role as any,
      avatarUrl: userRow.avatarUrl ? String(userRow.avatarUrl) : undefined,
      phone: userRow.phone ? String(userRow.phone) : undefined,
      cpf: userRow.cpf ? String(userRow.cpf) : undefined,
      criadoEm: String(userRow.criadoEm),
    };

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Erro crítico no endpoint de login:', error);
    return NextResponse.json({ success: false, error: 'Falha interna no servidor.' }, { status: 500 });
  }
}
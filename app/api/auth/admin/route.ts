import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, hashPassword, signSessionToken } from '@/lib/crypto';
import { checkRateLimit, recordFailedAttempt, clearRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const rateLimitKey = `admin_login_${ip}`;

    // 1. Rate limiting para proteção contra força bruta na senha do Admin
    const rateCheck = checkRateLimit(rateLimitKey);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Muitas tentativas de login incorretas. Aguarde ${rateCheck.retryAfterSeconds} segundos antes de tentar novamente.`,
        },
        { status: 429 }
      );
    }

    const admin = await db.getAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: 'Nenhum administrador configurado.' },
        { status: 500 }
      );
    }

    const isEmailMatch = email?.trim().toLowerCase() === admin.email.toLowerCase();
    const isPasswordMatch = await verifyPassword(password?.trim() || '', admin.passwordHash);

    if (isEmailMatch && isPasswordMatch) {
      clearRateLimit(rateLimitKey);

      const signedToken = signSessionToken({ role: 'admin', identifier: admin.email });
      const response = NextResponse.json({ success: true });

      response.cookies.set('cortedarainha_admin_token', signedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 dias
        path: '/',
      });

      return response;
    }

    // Registra falha de tentativa
    const attempt = recordFailedAttempt(rateLimitKey);
    if (attempt.remaining === 0) {
      return NextResponse.json(
        {
          error: 'Muitas tentativas incorretas. O login administrativo foi bloqueado temporariamente por 15 minutos por segurança.',
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: `E-mail ou senha incorretos. Restam ${attempt.remaining} tentativa(s).` },
      { status: 401 }
    );
  } catch (error) {
    console.error('Erro no login admin:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { currentPassword, newPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A nova senha deve conter no mínimo 6 caracteres.' },
        { status: 400 }
      );
    }

    const admin = await db.getAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: 'Administrador não encontrado.' },
        { status: 404 }
      );
    }

    // Valida a senha atual
    const isCurrentMatch = await verifyPassword(currentPassword || '', admin.passwordHash);
    if (!isCurrentMatch) {
      return NextResponse.json(
        { error: 'A senha atual informada está incorreta.' },
        { status: 400 }
      );
    }

    // Gera novo hash com bcrypt e atualiza no PostgreSQL
    const newHash = await hashPassword(newPassword);
    await db.updateAdminPassword(admin.email, newHash);

    return NextResponse.json({
      success: true,
      message: 'Senha administrativa alterada com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao atualizar senha admin:', error);
    return NextResponse.json(
      { error: 'Erro interno ao atualizar a senha.' },
      { status: 500 }
    );
  }
}

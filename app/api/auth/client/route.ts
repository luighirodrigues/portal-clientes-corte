import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, signSessionToken } from '@/lib/crypto';
import { checkRateLimit, recordFailedAttempt, clearRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const { slug, pin } = await req.json();
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'desconhecido';
    const rateLimitKey = `${ip}_${slug}`;

    // 1. Verificação de Rate Limit (Proteção contra Força Bruta)
    const rateCheck = checkRateLimit(rateLimitKey);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Muitas tentativas incorretas. Aguarde ${rateCheck.retryAfterSeconds} segundos antes de tentar novamente.`,
        },
        { status: 429 }
      );
    }

    if (!slug || !pin) {
      return NextResponse.json(
        { error: 'Slug e PIN são obrigatórios.' },
        { status: 400 }
      );
    }

    const client = await db.getClientBySlug(slug);
    if (!client) {
      return NextResponse.json(
        { error: 'Portal não encontrado.' },
        { status: 404 }
      );
    }

    // 2. Validação Criptográfica do PIN com bcrypt
    const isMatch = await verifyPassword(pin.trim(), client.pinHash);

    if (!isMatch) {
      const attempt = recordFailedAttempt(rateLimitKey);
      await db.logFailedAccess(client.id, ip, userAgent, 'PIN incorreto');

      if (attempt.remaining === 0) {
        return NextResponse.json(
          {
            error: `PIN incorreto. Limite atingido! O acesso foi bloqueado temporariamente por 15 minutos por segurança.`,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: `PIN incorreto. Restam ${attempt.remaining} tentativa(s).`,
        },
        { status: 401 }
      );
    }

    // 3. Sucesso: Limpa tentativas de rate limit e registra acesso
    clearRateLimit(rateLimitKey);

    if (client.deliveries.length > 0) {
      await db.registerAccess(client.deliveries[0].id, client.id, ip, userAgent);
    }

    // 4. Emissão do cookie assinado criptograficamente
    const signedToken = signSessionToken({ role: 'client', identifier: client.slug });
    const response = NextResponse.json({ success: true });

    response.cookies.set(`cortedarainha_client_${client.slug}`, signedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Erro na autenticação do cliente:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}

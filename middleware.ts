import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SECRET = process.env.APP_SECRET || 'cortedarainha_super_secret_key_32c';
const ADMIN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

/**
 * Validação criptográfica do token usando a API nativa Web Crypto.
 * Funciona de forma transparente em todos os runtimes do Next.js (Node.js e Edge).
 */
async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return false;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Decodifica base64url da assinatura
    const base64 = signature.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const binaryStr = atob(padded);
    const sigBytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      sigBytes[i] = binaryStr.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      enc.encode(payload)
    );

    if (!isValid) return false;

    // Decodifica payload e valida expiração
    const payloadBase64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const payloadPadded = payloadBase64.padEnd(payloadBase64.length + ((4 - (payloadBase64.length % 4)) % 4), '=');
    const decoded = JSON.parse(atob(payloadPadded));

    if (decoded.role !== 'admin') return false;
    if (Date.now() - decoded.ts > ADMIN_MAX_AGE_MS) return false;

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('cortedarainha_admin_token')?.value;

  // Proteger rotas /admin (exceto /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const isValid = await verifyAdminToken(token);
    if (!isValid) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('cortedarainha_admin_token');
      return response;
    }
  }

  // Se o admin já estiver autenticado e tentar acessar /admin/login, redireciona ao dashboard
  if (pathname === '/admin/login') {
    if (token) {
      const isValid = await verifyAdminToken(token);
      if (isValid) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

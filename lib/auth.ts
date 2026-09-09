import { cookies } from 'next/headers';
import { signSessionToken, verifySessionToken } from './crypto';

const ADMIN_COOKIE_NAME = 'cortedarainha_admin_token';
const CLIENT_COOKIE_PREFIX = 'cortedarainha_client_';

export function setAdminSession(email: string) {
  const cookieStore = cookies();
  const token = signSessionToken({ role: 'admin', identifier: email });

  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: '/',
  });
}

export function clearAdminSession() {
  const cookieStore = cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

export function isAdminAuthenticated(): boolean {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME);
  if (!token?.value) return false;

  const session = verifySessionToken(token.value);
  return session !== null && session.role === 'admin';
}

export function setClientSession(slug: string) {
  const cookieStore = cookies();
  const token = signSessionToken({ role: 'client', identifier: slug });

  cookieStore.set(`${CLIENT_COOKIE_PREFIX}${slug}`, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 dias
    path: '/',
  });
}

export function isClientAuthenticated(slug: string): boolean {
  const cookieStore = cookies();
  const token = cookieStore.get(`${CLIENT_COOKIE_PREFIX}${slug}`);
  if (!token?.value) return false;

  const session = verifySessionToken(token.value);
  return session !== null && session.role === 'client' && session.identifier === slug;
}

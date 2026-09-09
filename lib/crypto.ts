import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const SECRET = process.env.APP_SECRET || 'cortedarainha_super_secret_key_32c';
const ENCRYPTION_KEY = crypto.createHash('sha256').update(SECRET).digest(); // 32 bytes
const IV_LENGTH = 12; // 12 bytes recomendado para GCM

export const TOKEN_EXPIRATION = {
  admin: 7 * 24 * 60 * 60 * 1000, // 7 dias
  client: 30 * 24 * 60 * 60 * 1000, // 30 dias
};

/**
 * Hash irreversível com bcrypt (salt 10 rounds).
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

/**
 * Validação com bcrypt resistente a timing attacks.
 */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

/**
 * Criptografia autenticada AES-256-GCM.
 * Impede manipulação e adulteração de dados com tag de autenticação.
 */
export function encryptPin(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decodificação autenticada AES-256-GCM (com fallback seguro para formato anterior).
 */
export function decryptPin(payload: string): string {
  try {
    const parts = payload.split(':');
    // Novo formato GCM: iv:authTag:ciphertext
    if (parts.length === 3) {
      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encryptedText = parts[2];
      const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }

    // Fallback de compatibilidade CBC: iv:ciphertext
    if (parts.length === 2) {
      const iv = Buffer.from(parts[0], 'hex');
      const encryptedText = parts[1];
      const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }

    return '';
  } catch (error) {
    console.error('Erro ao descriptografar PIN:', error);
    return '';
  }
}

/**
 * Assina token de sessão com HMAC-SHA256 e timestamp.
 */
export function signSessionToken(data: { role: 'admin' | 'client'; identifier: string }): string {
  const payload = Buffer.from(JSON.stringify({ ...data, ts: Date.now() })).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

/**
 * Validação criptográfica do token com verificação de tamanho de buffer e expiração.
 */
export function verifySessionToken(token: string): { role: 'admin' | 'client'; identifier: string; ts: number } | null {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return null;

    const expectedSig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
    
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);

    // Evita exception de timingSafeEqual em caso de tamanhos divergentes
    if (sigBuf.length !== expBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    
    // Verificação de expiração do token
    const maxAge = TOKEN_EXPIRATION[decoded.role as 'admin' | 'client'];
    if (maxAge && Date.now() - decoded.ts > maxAge) {
      return null; // Token expirado
    }

    return decoded;
  } catch {
    return null;
  }
}

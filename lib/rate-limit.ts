interface AttemptRecord {
  count: number;
  firstAttemptTime: number;
  blockedUntil?: number;
}

const attemptsMap = new Map<string, AttemptRecord>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const BLOCK_DURATION_MS = 15 * 60 * 1000; // Bloqueia por 15 minutos se errar 5 vezes

export function checkRateLimit(key: string): { allowed: boolean; remaining: number; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = attemptsMap.get(key);

  if (!record) {
    return { allowed: true, remaining: MAX_ATTEMPTS };
  }

  // Verifica se está temporariamente bloqueado
  if (record.blockedUntil && now < record.blockedUntil) {
    const retryAfterSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  // Se a janela de 10 minutos expirou, reseta o contador
  if (now - record.firstAttemptTime > WINDOW_MS) {
    attemptsMap.delete(key);
    return { allowed: true, remaining: MAX_ATTEMPTS };
  }

  const remaining = Math.max(0, MAX_ATTEMPTS - record.count);
  return { allowed: record.count < MAX_ATTEMPTS, remaining };
}

export function recordFailedAttempt(key: string): { remaining: number; blockedUntilSeconds?: number } {
  const now = Date.now();
  const record = attemptsMap.get(key) || { count: 0, firstAttemptTime: now };

  record.count += 1;

  if (record.count >= MAX_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_DURATION_MS;
    attemptsMap.set(key, record);
    return { remaining: 0, blockedUntilSeconds: Math.ceil(BLOCK_DURATION_MS / 1000) };
  }

  attemptsMap.set(key, record);
  return { remaining: MAX_ATTEMPTS - record.count };
}

export function clearRateLimit(key: string) {
  attemptsMap.delete(key);
}

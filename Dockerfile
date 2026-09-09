# ===================================================
# Dockerfile Multi-Stage para Produção (Next.js + Prisma)
# Compatível com Easypanel, Coolify, VPS e Docker Compose
# ===================================================

# 1. Imagem base com OpenSSL e dependências do Alpine
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl

# 2. Instalação das dependências
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

RUN npm install

# 3. Compilação da aplicação
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Gera o client do Prisma e compila em modo standalone
RUN npx prisma generate
RUN npm run build

# 4. Imagem final leve de execução
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Criação de usuário seguro para execução
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Cria pasta de uploads persistente
RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app

# Cópia dos assets públicos e do bundle standalone
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]

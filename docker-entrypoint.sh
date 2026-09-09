#!/bin/sh
set -e

echo "=================================================="
echo "  Iniciando Portal Corte da Rainha (Produção)     "
echo "=================================================="

# Garante que a pasta de uploads persistente existe
mkdir -p /app/public/uploads

# Aplica migrações ou esquemas do Prisma no PostgreSQL
echo "==> Sincronizando schema do banco com Prisma..."
npx prisma db push --skip-generate

# Executa seed inicial seguro (idempotente)
echo "==> Verificando dados iniciais..."
node prisma/seed.js || true

echo "==> Servidor pronto! Iniciando Next.js na porta ${PORT:-3000}..."
exec node server.js

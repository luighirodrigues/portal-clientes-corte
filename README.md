# 👑 Corte da Rainha — Portal de Clientes & Gestão de Conteúdo

Portal exclusivo de entrega de conteúdos audiovisuais e gestão de clientes para a **Corte da Rainha**. Desenvolvido com **Next.js 14 (App Router)**, **PostgreSQL** com **Prisma ORM**, autenticação criptográfica e design editorial de alto padrão.

---

## ✨ Funcionalidades

- **Portais Exclusivos das Clientes (`/[slug]`):**
  - Protegido por PIN numérico de 4 a 8 dígitos com teclado numérico nativo mobile.
  - Sessões assinadas com HMAC-SHA256 via Web Crypto API (30 dias de duração).
  - Identidade visual editorial com selo giratório vetorial, tipografia Fraunces + Outfit, carrossel de captações, métricas e botão de acesso direto ao Google Drive.
- **Painel Administrativo (`/admin`):**
  - Acesso protegido para a equipe com rate-limiting e bloqueio contra força bruta.
  - Cadastro e edição de clientes com personalização de URL (`slug`), foto de capa e redefinição rápida de PIN.
  - Botão **1-Clique para WhatsApp**: copia mensagem formatada pronta para enviar à cliente com o link do portal e o PIN.
  - Lançamento de novas entregas de conteúdo com contadores de fotos, vídeos e horas de captação.
  - Monitoramento de acessos em tempo real por entrega.
- **Segurança Reforçada:**
  - Senhas de administradores e PINs de clientes armazenados com hash irreversível `bcrypt`.
  - Criptografia autenticada `AES-256-GCM` para cópia segura do PIN no painel.
  - Proteção contra upload malicioso (validação de magic bytes, MIME types e limite de 10MB).
  - Headers HTTP defensivos (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).

---

## 🛠️ Tecnologias

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/) via [Prisma ORM](https://www.prisma.io/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Containerização:** [Docker](https://www.docker.com/) com multi-stage build Alpine standalone

---

## 🚀 Como Executar Localmente

### 1. Clonar o repositório
```bash
git clone https://github.com/luighirodrigues/portal-clientes-corte.git
cd portal-clientes-corte
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

### 4. Iniciar o Banco PostgreSQL no Docker
```bash
docker compose up -d postgres
```

### 5. Executar Migrações e Seed Inicial
```bash
npx prisma db push
node prisma/seed.js
```

### 6. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000`.

- **Credenciais do Admin Inicial:**
  - URL: `http://localhost:3000/admin`
  - E-mail: `admin@cortedarainha.com.br`
  - Senha: `admin123`

---

## 🚢 Deploy em Produção (Easypanel / Docker)

### Opção 1: Easypanel
1. Crie um projeto no Easypanel (ex: `cortedarainha`).
2. Adicione um serviço **Database -> PostgreSQL**.
3. Adicione um serviço **App** conectado a este repositório Git, selecionando o método de build **Dockerfile**.
4. Configure as variáveis de ambiente:
   - `DATABASE_URL`: URL do PostgreSQL do passo 2.
   - `APP_SECRET`: Chave secreta de 32+ caracteres.
   - `PORT`: `3000`
   - `NODE_ENV`: `production`
5. Em **Storage / Mounts**, adicione um volume persistente para fotos:
   - **Mount Path:** `/app/public/uploads`
6. Em **Domains**, aponte seu domínio com SSL HTTPS automático.

### Opção 2: Docker Compose (VPS)
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

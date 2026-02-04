# 🧩 T3 Tasks SaaS — Code Challenge

Aplicação full stack construída com a T3 Stack simulando um produto SaaS real com autenticação, dashboard e gerenciamento de tarefas.

Projeto deployado:
```bash
https://t3-tasks-saas.vercel.app/sign-in
```
https://t3-tasks-saas.vercel.app/sign-in

Este projeto demonstra:

- Tipagem forte ponta a ponta
- Validação única com Zod
- Comunicação frontend ↔ backend via tRPC
- Modelagem tipada com Drizzle ORM
- UI moderna com Tailwind + shadcn/ui
- Arquitetura organizada como um SaaS real

---

## 🧰 Stack Utilizada

- Next.js (App Router)
- TypeScript
- tRPC
- Drizzle ORM
- Better Auth
- Zod
- Tailwind CSS
- shadcn/ui
- PostgreSQL

---

## 📦 Pré-requisitos

Antes de rodar o projeto, você precisa ter instalado:

- Node.js (LTS)
- npm
- Docker e Docker Compose

---

## 🚀 Como baixar, instalar e rodar o projeto

### 1) Clonar o repositório

```bash
git clone https://github.com/filipe-fragallo/t3-tasks-saas.git
cd t3-tasks-saas
```

### 2) Instalar as dependências

```bash
npm install
```

### 3) Subir o banco PostgreSQL com Docker

```bash
docker compose up -d
docker ps
```

### 4) Criar o arquivo .env

```env
DATABASE_URL="postgres://postgres:postgres@localhost:5432/t3_challenge"
AUTH_URL="http://localhost:3000"
AUTH_SECRET="troque-por-uma-chave-segura"
```

### 5) Preparar o banco com Drizzle

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

ou

```bash
npm run db:push
```

### 6) Rodar o projeto

```bash
npm run dev
```

Acesse:

http://localhost:3000

---

## 🧪 Scripts disponíveis

| Script | Função |
|--------|--------|
| npm run dev | Rodar em desenvolvimento |
| npm run build | Build de produção |
| npm run start | Rodar build |
| npm run preview | Build + start |
| npm run lint | Lint |
| npm run typecheck | Checagem de tipos |
| npm run check | Lint + typecheck |
| npm run db:generate | Gerar migrations |
| npm run db:migrate | Aplicar migrations |
| npm run db:push | Sincronizar schema (dev) |
| npm run db:studio | Abrir Drizzle Studio |

---

## ✅ Funcionalidades

### Autenticação

- Sign Up
- Sign In
- Logout
- Rotas protegidas
- Validação com Zod

### Dashboard

- Layout com sidebar
- Exibição do usuário autenticado

### CRUD de Tasks

- Criar
- Listar apenas do usuário logado
- Editar
- Excluir

**Regras obrigatórias:**

- Task pertence ao usuário autenticado
- Apenas o dono pode visualizar, editar ou excluir
- Validação no frontend e backend com o mesmo schema Zod

---

## 🏗️ Arquitetura da Aplicação

A arquitetura foi pensada para refletir a organização de um produto SaaS real, separando claramente:

- Rotas
- Componentes de UI
- Regras de negócio
- Validação
- Autenticação
- Acesso a dados

O objetivo foi manter separação de responsabilidades, reutilização de código e tipagem forte ponta a ponta.

---

### 🔹 Camada de Rotas — Next.js App Router

Local: `src/app`

O diretório `app` contém exclusivamente rotas da aplicação.

```
(auth)        → páginas públicas (login/cadastro)
(protected)   → páginas protegidas (dashboard, tasks, users, admin)
api/          → endpoints HTTP do Next (tRPC e Better Auth)
```

- `(auth)` agrupa telas públicas
- `(protected)` agrupa telas autenticadas
- O `layout.tsx` do `(protected)` implementa o layout SaaS com sidebar

---

### 🔹 Camada de Componentes (UI)

Local: `src/components`

Tudo que é componente reutilizável fica fora do `app`.

**Regra adotada:**

> Se não é `page.tsx` ou `layout.tsx`, não pertence ao `app/`.

---

### 🔹 Camada de Comunicação — tRPC

Locais:

- `src/app/api/trpc/[trpc]/route.ts`
- `src/trpc/*`
- `src/server/api/*`

Fluxo:

```
React → tRPC React → Router tRPC → Drizzle → PostgreSQL
```

Toda comunicação frontend ↔ backend é tipada.

---

### 🔹 Camada de Regras de Negócio — Routers

Local: `src/server/api/routers`

Aqui ficam as regras reais da aplicação:

- Garantir que a task pertence ao usuário
- Validar sessão autenticada
- Validar dados com Zod antes de acessar o banco

---

### 🔹 Camada de Validação — Zod (fonte única)

Local: `src/server/schemas`

Os schemas Zod são utilizados:

- Nos formulários do frontend
- Nos inputs do tRPC
- Como contrato oficial da aplicação

---

### 🔹 Camada de Dados — Drizzle ORM

Local: `src/server/db`

Contém todas as tabelas:

- Tabelas do sistema (tasks)
- Tabelas do Better Auth (user, session, account, verification)

Tudo que gera migration mora aqui.

---

### 🔹 Autenticação — Better Auth

Local: `src/server/better-auth`

Handler HTTP exposto em:

```
src/app/api/auth/[...all]/route.ts
```

---

### 🔁 Fluxo de Dados da Aplicação

Exemplo: criação de uma task

```
Formulário React
   ↓
Validação Zod (frontend)
   ↓
tRPC mutation
   ↓
Validação Zod (backend)
   ↓
Verificação do usuário autenticado
   ↓
Drizzle ORM
   ↓
PostgreSQL
```

O mesmo schema Zod é usado do início ao fim.

---

## 🗂️ Estrutura de Pastas

```
.
├─ .next
├─ drizzle/
│  ├─ 0000_wide_slyde.sql
│  ├─ 0001_lethal_machine_man.sql
│  └─ meta/
│     ├─ _journal.json
│     ├─ 0000_snapshot.json
│     └─ 0001_snapshot.json
├─ node_modules/
├─ public/
│  └─ favicon.ico
│
├─ src/
│  ├─ app/
│  │  ├─ (auth)/
│  │  │  ├─ sign-in/
│  │  │  │  └─ page.tsx
│  │  │  └─ sign-up/
│  │  │     └─ page.tsx
│  │  │
│  │  ├─ (protected)/
│  │  │  ├─ layout.tsx
│  │  │  ├─ admin/
│  │  │  │  └─ page.tsx
│  │  │  ├─ dashboard/
│  │  │  │  └─ page.tsx
│  │  │  ├─ tasks/
│  │  │  │  └─ page.tsx
│  │  │  └─ users/
│  │  │     └─ page.tsx
│  │  │
│  │  ├─ api/
│  │  │  ├─ auth/
│  │  │  │  └─ routes.ts
│  │  │  └─ trpc/
│  │  │     └─ route.ts
│  │  │
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  │
│  ├─ components/
│  │  ├─ dashboard/
│  │  │  └─ user-card.tsx
│  │  ├─ Sidebar/
│  │  │  └─ Sidecar.tsx
│  │  └─ ui/
│  │
│  ├─ lib/
│  │  ├─ auth-client.ts
│  │  ├─ auth.ts
│  │  └─ utils.ts
│  │
│  ├─ server/
│  │  ├─ api/
│  │  │  ├─ routers/
│  │  │  │  ├─ admin.ts
│  │  │  │  ├─ tasks.ts
│  │  │  │  └─ users.ts
│  │  │  ├─ root.ts
│  │  │  └─ trpc.ts
│  │  │
│  │  ├─ better-auth/
│  │  │  ├─ client.ts
│  │  │  ├─ server.ts
│  │  │  ├─ config.ts
│  │  │  └─ index.ts
│  │  │
│  │  ├─ db/
│  │  │  ├─ schema.ts
│  │  │  ├─ index.ts
│  │  │  ├─ make-admin.ts
│  │  │  └─ seeds/
│  │  │     └─ seed-admin.ts
│  │  │
│  │  └─ schemas/
│  │     ├─ admin.ts
│  │     ├─ auth.ts
│  │     ├─ role.ts
│  │     ├─ tasks.ts
│  │     └─ users.ts
│  │
│  ├─ styles/
│  │  └─ globals.css
│  │
│  ├─ trpc/
│  │  ├─ query-client.ts
│  │  ├─ react.tsx
│  │  └─ server.ts
│  │
│  ├─ auth-schema.ts
│  └─ component.json
│
├─ .env
├─ .env.example
├─ .gitignore
├─ Auth-schema.ts
├─ Componente.json
├─ Docker-compose.yml
├─ Drizzle.config.ts
├─ Eslint.config.js
├─ Next-env.d.ts
├─ Next.config.js
├─ Package-lock.json
├─ Package.json
├─ Postos.config.js
├─ Prettier.config.js
├─ README.md
├─ Start-database.sh
└─ tsconfig.json
```

---

## 🔐 Segurança das Tasks

Toda operação valida:

1. Usuário autenticado
2. Task pertence ao usuário
3. Dados validados com Zod

---

## 🧹 Qualidade de Código

- ESLint
- Prettier
- Typecheck
- Tipagem end-to-end com tRPC + Zod + Drizzle

---

## 📌 Conclusão

Este projeto demonstra a aplicação prática da T3 Stack com uma arquitetura organizada como um SaaS real, priorizando separação de responsabilidades, tipagem forte, validação única e boas práticas modernas de desenvolvimento.

 

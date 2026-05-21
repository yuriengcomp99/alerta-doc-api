# Alerta Doc API

API core do Alerta Doc — autenticação e gestão de documentos.

## Stack

- **Node.js** + **Express** (TypeScript)
- **Prisma ORM** + **PostgreSQL**
- **RabbitMQ** (só no Docker Compose — uso pelo cron job externo)
- **Nginx** (reverse proxy)
- **Docker Compose**

## Pré-requisitos

- Node.js 20+
- Docker e Docker Compose

## Início rápido

```bash
# 1. Variáveis de ambiente
cp .env.example .env

# 2. Subir infraestrutura (Postgres, RabbitMQ, API, Nginx)
docker compose up -d

# 3. Migrações (com containers rodando ou Postgres local)
npm install
npm run prisma:generate
npm run prisma:migrate
```

## Desenvolvimento local (sem Docker na API)

```bash
cp .env.example .env
docker compose up -d postgres
# rabbitmq opcional: docker compose up -d rabbitmq
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

A API fica em `http://localhost:3000`. Com Nginx: `http://localhost`.

## Swagger

Documentação interativa (OpenAPI 3):

| URL | Descrição |
|-----|-----------|
| `http://127.0.0.1:3000/docs` ou `/docs/` | UI Swagger |
| `http://127.0.0.1:3000/docs/openapi.json` | Spec JSON |
| `http://127.0.0.1/docs` | UI via Nginx |

No Swagger UI, use **Authorize** com o `accessToken` (Bearer) ou `x-api-key` no introspect.

Swagger usa `swagger-ui-express` padrão. No Docker, após `npm install` local, rode:

```bash
docker compose exec api npm install
docker compose restart api
```

(O volume `/app/node_modules` do container é isolado do host.)

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Health check (inclui status do banco) |
| POST | `/api/auth/register` | Cadastro (retorna access + refresh token) |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Renovar tokens (rotação do refresh) |
| POST | `/api/auth/logout` | Revogar sessão |
| GET | `/api/auth/me` | Usuário autenticado (`Authorization: Bearer`) |
| POST | `/api/auth/introspect` | Validar token (outros microserviços, header `x-api-key`) |
| GET | `/api/documents` | Listar documentos do usuário (Bearer) |
| POST | `/api/documents` | Criar documento (`multipart/form-data`) |
| GET | `/api/documents/:id` | Buscar documento (Bearer) |
| PATCH | `/api/documents/:id` | Atualizar (JSON ou multipart) |
| DELETE | `/api/documents/:id` | Excluir documento (Bearer) |

Tokens são **opacos** e persistidos como hash em `auth_sessions` — adequado para validação compartilhada entre microserviços.

## Serviços Docker

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| postgres | 5432 | Banco de dados |
| rabbitmq | 5672 | AMQP |
| rabbitmq (management) | 15672 | UI (`guest` / `guest`) |
| api | 3000 (interno) | API Express |
| nginx | 80 | Proxy reverso |

## Scripts

```bash
npm run dev              # Desenvolvimento com hot reload
npm run build            # Compilar TypeScript
npm run start            # Produção (dist/)
npm run prisma:generate  # Gerar Prisma Client
npm run prisma:migrate   # Rodar migrações
npm run prisma:studio    # Prisma Studio
```

## Estrutura

```
src/
├── config/
├── lib/
├── middleware/
├── routes/              # Registro central (→ app)
├── modules/auth/
│   ├── types/
│   ├── mappers/
│   ├── repositories/    # Interface + Prisma
│   ├── use-cases/
│   ├── controllers/
│   ├── factories/
│   └── auth.routes.ts
└── modules/documents/
    ├── repositories/
    ├── use-cases/
    ├── controllers/
    ├── factories/
    └── documents.routes.ts
```

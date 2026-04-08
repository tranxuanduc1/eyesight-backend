# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Eyesight Backend - a NestJS API (v11) with TypeScript, using Prisma ORM (v7) with PostgreSQL. Provides user management, JWT authentication, chat, messaging, and chatbot endpoints. Runs on port 3001.

## Common Commands

- **Install:** `npm install`
- **Dev server:** `npm run start:dev` (watch mode)
- **Build:** `npm run build` (uses `nest build`)
- **Lint:** `npm run lint` (ESLint with auto-fix)
- **Format:** `npm run format` (Prettier)
- **Run all tests:** `npm test` (Jest, rootDir is `src/`, matches `*.spec.ts`)
- **Run single test:** `npx jest --testPathPattern=<pattern>` (e.g., `npx jest --testPathPattern=app.controller`)
- **E2E tests:** `npm run test:e2e` (config in `test/jest-e2e.json`)
- **Test coverage:** `npm run test:cov`
- **Prisma generate:** `npx prisma generate` (outputs to `generated/prisma/`)
- **Prisma migrate (dev):** `npx prisma migrate dev`
- **Prisma migrate (deploy):** `npx prisma migrate deploy`
- **Docker (full stack):** `docker compose up` (Postgres on 5432, Adminer on 8080, backend on 3001)

## Architecture

### Module Structure (NestJS)

Each domain has its own module under `src/` following NestJS conventions (module, controller, service):

- **AppModule** (`src/app.module.ts`) - root module, imports all feature modules
- **UserModule** (`src/user/`) - user CRUD
- **AuthModule** (`src/auth/`) - JWT-based auth with Passport; login/register endpoints
- **ChatModule** (`src/chat/`) - chat CRUD, also handles adding/retrieving messages per chat
- **MessageModule** (`src/message/`) - standalone message CRUD
- **ChatbotModule** (`src/chatbot/`) - ophthalmology chatbot: accepts fundus images + patient metadata, calls external DR and Ocular ML services, then streams LLM responses via SSE (AsyncGenerator pattern)

### Database Layer

- **Prisma schema:** `prisma/schema.prisma` - models: User, Chat, Message, Attachment (Message has a 1:1 optional Attachment for images/metadata)
- **Prisma client output:** `generated/prisma/` (CJS format, custom output path)
- **Prisma config:** `prisma.config.ts` (loads DATABASE_URL from env via dotenv)
- **DB singleton:** `lib/db.ts` - shared PrismaClient instance using `@prisma/adapter-pg` (pg driver adapter); services import from `../../lib/db`
- **Migrations:** `prisma/migrations/`

### Auth

- JWT strategy via `@nestjs/passport` + `passport-jwt`
- `JwtGuard` (`src/auth/jwt.guard.ts`) protects routes
- JWT secret from `JWT_SECRET` env var (falls back to `'super_secret_key'`)
- Passwords hashed with bcrypt

### Chatbot Pipeline

`ChatbotService.processMessage` is an `AsyncGenerator` that yields SSE-style objects: `{ type: 'dr_result' }`, `{ type: 'ocular_result' }`, `{ type: 'delta', delta: string }`, `{ type: 'done' }`, `{ type: 'error' }`. Flow:
1. Store fundus images to `uploads/fundus/` on disk
2. Atomic DB write (user message + attachment)
3. Parallel calls to DR model and Ocular model services
4. Stream LLM response, save assistant message on completion

### Environment Variables

See `.example.env`: `PORT`, `DATABASE_URL`, `JWT_SECRET`, `DR_MODEL_SERVICE_URL`, `OCULAR_MODEL_SERVICE_URL`, `LLM_SERVICE_URL`

## CI/CD

GitHub Actions (`.github/workflows/node.js.yml`): on push/PR to `main` - runs `npm ci`, build, test on Node 20.x. Deploy job SSHes to server on push to main.

## Key Conventions

- TypeScript with `nodenext` module resolution, target ES2023
- ESLint: `@typescript-eslint/no-explicit-any` is off; floating promises and unsafe arguments are warnings
- Prettier: configured in `.prettierrc`

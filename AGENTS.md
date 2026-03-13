# AGENTS.md

## Cursor Cloud specific instructions

### Overview

**Codexia - Jogos Retrô** — web app com 35 jogos clássicos, sistema de créditos/desbloqueio, tarefas e autenticação, com dados persistidos em PostgreSQL.

### Tech stack

- **Backend:** Node.js 20 + Express 5 + `pg` (node-postgres)
- **Banco:** PostgreSQL 16
- **Auth:** JWT (`jsonwebtoken`) + `bcryptjs`
- **Frontend:** HTML5 + CSS3 + vanilla JavaScript (Canvas para jogos de ação, DOM para puzzle/board)
- **Deploy:** Docker + Docker Compose

### Running locally

```bash
docker compose up -d --build    # Sobe PostgreSQL + App
# App fica em http://localhost:3000
```

Ou sem Docker:
```bash
npm install
# Precisa de PostgreSQL rodando (ajuste DATABASE_URL)
export DATABASE_URL=postgresql://user:pass@localhost:5432/arcade
node server/index.js
```

### Structure

- `index.html` — SPA entry point
- `css/style.css` — estilos (tema arcade escuro)
- `js/app.js` — lógica principal (nav, créditos, tarefas, auth)
- `js/api.js` — cliente HTTP para a API
- `js/games/*.js` — 35 jogos individuais (carregados sob demanda)
- `server/index.js` — servidor Express
- `server/db.js` — pool de conexão PostgreSQL
- `server/routes.js` — todas as rotas da API
- `init.sql` — schema do banco
- `docker-compose.yml` — PostgreSQL + App
- `Dockerfile` — imagem Node.js

### Environment variables

| Variável | Padrão | Descrição |
|---|---|---|
| `DATABASE_URL` | `postgresql://arcade:arcade@localhost:5432/arcade` | String de conexão PostgreSQL |
| `JWT_SECRET` | `arcade-secret-...` | Segredo para assinar tokens JWT |
| `PORT` | `3000` | Porta do servidor |

### API endpoints

- `POST /api/auth/register` — registro
- `POST /api/auth/login` — login
- `GET /api/auth/me` — usuário atual
- `GET /api/profile` — perfil completo (stats, unlocks, scores, tasks)
- `POST /api/credits/buy` — comprar créditos
- `POST /api/games/unlock` — desbloquear jogo
- `POST /api/games/score` — registrar pontuação (auto-completa tarefas)
- `POST /api/profile/reset` — resetar progresso
- `GET /api/health` — health check

### Key gotchas

- O banco é inicializado automaticamente via `init.sql` ao iniciar o servidor.
- Game scripts são carregados dinamicamente via `<script>` injection.
- Express 5 usa `path-to-regexp` v8 — wildcards precisam ser nomeados (não usar `*` puro).
- O `docker-compose.yml` espera pela health check do PostgreSQL antes de iniciar o app.

### Deploy no Coolify

1. Usar **Docker Compose** como build pack
2. Configurar `JWT_SECRET` como variável de ambiente no Coolify
3. O volume `pgdata` persiste dados do PostgreSQL entre deploys

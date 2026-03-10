# 🌸 Bloom – Flower Marketplace

Marketplace bunga online dengan fitur role-based access (user, owner, admin).

## Tech Stack

- **Frontend** — Next.js 16 (App Router), React, TypeScript, Tailwind CSS 4
- **Backend** — Supabase (Auth + PostgreSQL + RLS)
- **State** — Zustand (cart), React Context (auth, favorites)
- **Testing** — Vitest

## Project Structure

```
web/                    ← Semua kode ada di sini
├── src/
│   ├── app/            # Pages & API Routes (App Router)
│   ├── components/     # UI Components
│   └── lib/            # Contexts, stores, types, utils
├── public/             # Static assets
├── .env.local          # Supabase credentials
└── package.json

_deployment/            ← Arsip config deploy (abaikan saat develop)
```

## Quick Start

```bash
cd web
npm install
npm run dev
```

Buka http://localhost:3000

## Test Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@flowermarket.com | admin123456 | admin |
| owner.edelweis@gmail.com | owner123456 | owner |
| buyer@gmail.com | buyer123456 | user |

## Roles

| Role | Capabilities |
|------|-------------|
| **user** | Browse, cart, favorites, apply jadi owner |
| **owner** | + Kelola toko & produk sendiri |
| **admin** | + Kelola semua toko, review aplikasi owner |

## Useful Commands

```bash
cd web
npm run dev          # Development server
npm run build        # Production build
npm test             # Run tests
npm run lint         # Lint check
```

## Deployment

Config deployment tersimpan di `_deployment/`. Lihat folder tersebut ketika siap deploy.

---

MIT License

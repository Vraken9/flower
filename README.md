# 🌸 Bloom – Flower Marketplace

Marketplace bunga dengan akses berbasis peran (user, owner, admin) lengkap dengan cart, favorit, dan dashboard pengelolaan toko.

## Tech stack
- Next.js 16 (App Router), React, TypeScript, Tailwind CSS 4
- Supabase (Auth + PostgreSQL + RLS)
- Zustand (cart) & React Context (auth/favorites)
- Vitest untuk testing

## Prasyarat
- Node.js 20+ & npm
- Project Supabase beserta `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, dan `SUPABASE_SERVICE_ROLE_KEY` (server only)
- Opsional: Docker (lihat `_deployment/`)

## Struktur singkat
```
web/
├── src/              # App Router pages, API routes, components, utils
├── public/           # Static assets
├── .env.local        # Jangan commit (gunakan template .env.example)
└── package.json
```

## Setup lokal
1) `cd web`  
2) `cp .env.example .env.local` lalu isi nilai Supabase (service_role hanya dipakai server).  
3) `npm install`  
4) `npm run dev` dan buka http://localhost:3000  

## Script utama
- `npm run dev` – dev server
- `npm run build` / `npm start` – build & run produksi
- `npm run lint` – cek lint
- `npm test` / `npm run test:integration` – unit & integrasi (butuh env Supabase)

## Akun uji (seed)
- Admin: `admin@flowermarket.com` / `admin123456`
- Owner: `owner.edelweis@gmail.com` / `owner123456`
- User: `buyer@gmail.com` / `buyer123456`

## Keamanan & deployment
- Jangan commit `.env*`, `.next`, atau `node_modules` (sudah di `.gitignore`); simpan kunci di GitHub Secrets untuk CI/CD.
- Catatan deploy internal disimpan lokal (tidak ikut dipublish) agar repository publik tetap bersih dan profesional.

MIT License

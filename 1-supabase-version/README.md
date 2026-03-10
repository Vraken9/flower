# 🌸 Flower Marketplace — Supabase Version

Versi ini menggunakan **Supabase Cloud** sebagai database dan auth.
Tidak perlu backend sendiri — Next.js langsung konek ke Supabase.

## Struktur

```
1-supabase-version/
├── docker-compose.yml    ← Deploy ke VPS dengan Docker
├── .env.example          ← Template env untuk deploy
├── supabase/             ← SQL migrations untuk Supabase
│   ├── migrations/
│   ├── fix-applications-policies.sql
│   └── run-all-migrations.sql
└── README.md             ← File ini
```

Frontend ada di `../web/` (folder `web` di root proyek).

## 🚀 Development Lokal

```powershell
# 1. Masuk ke folder web
cd ../web

# 2. Install (kalau belum)
npm install

# 3. Jalankan
npm run dev
```

Buka http://localhost:3000 — Selesai! ✅

> File `.env.local` di folder `web/` sudah berisi kredensial Supabase.

## 🐳 Deploy ke VPS (Docker)

```bash
# 1. Copy dan isi environment
cp .env.example .env
nano .env

# 2. Build & run
docker-compose up -d --build

# 3. Akses
# http://your-server-ip:3000
```

## 📦 Setup Supabase (Pertama Kali)

1. Buat project di [supabase.com](https://supabase.com)
2. Buka SQL Editor
3. Jalankan file `supabase/run-all-migrations.sql`
4. Copy URL dan Keys ke `.env.local` di `../web/`

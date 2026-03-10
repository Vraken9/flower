# 🌸 Flower Marketplace — Self-Hosted Version

Versi ini menggunakan **PostgreSQL lokal + Express.js backend**.
Tidak tergantung Supabase — semua di server sendiri.

## Struktur

```
2-selfhosted-version/
├── backend/              ← Express.js API server
│   ├── routes/
│   ├── controllers/
│   ├── middlewares/
│   └── Dockerfile
├── database/             ← PostgreSQL schema
│   └── init.sql
├── nginx/                ← Reverse proxy config
│   └── nginx.conf
├── docker-compose.yml    ← Deploy semua service
├── .env.example          ← Template env
└── README.md             ← File ini
```

Frontend ada di `../web/` (folder `web` di root proyek).

## 🚀 Development Lokal (Tanpa Docker)

Butuh: Node.js 18+ dan PostgreSQL terinstall lokal.

### Terminal 1: Backend

```powershell
cd backend
npm install

# Set environment
$env:DATABASE_URL = "postgresql://postgres:password@localhost:5432/flower_marketplace"
$env:JWT_SECRET = "dev-secret-key-min-32-characters-long"
$env:PORT = "5000"

npm run dev
```

### Terminal 2: Frontend

```powershell
cd ../web
npm install
npm run dev
```

### Akses

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## 🐳 Deploy ke VPS (Docker) — Recommended

```bash
# 1. Copy dan isi environment
cp .env.example .env
nano .env   # Ganti password dan JWT secret!

# 2. Build & run semua service
docker-compose up -d --build

# 3. Cek status
docker-compose ps
docker-compose logs -f

# 4. Akses
# http://your-server-ip (via Nginx)
# http://your-server-ip:3000 (frontend langsung)
# http://your-server-ip:5000 (backend API langsung)
```

## 🗄️ Database Management

```bash
# Connect ke PostgreSQL
docker exec -it flower_db psql -U flower_user -d flower_marketplace

# Lihat tabel
\dt

# Lihat users
SELECT id, email, role FROM users;

# Keluar
\q
```

## 🔧 Service yang Berjalan

| Service    | Port | Deskripsi                    |
| ---------- | ---- | ---------------------------- |
| Nginx      | 80   | Reverse proxy (entry point)  |
| Frontend   | 3000 | Next.js                      |
| Backend    | 5000 | Express.js API               |
| PostgreSQL | 5432 | Database                     |

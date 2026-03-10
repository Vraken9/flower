# 🚀 Panduan Deploy Flower Marketplace ke VPS

Panduan lengkap untuk mendeploy proyek ke VPS (Virtual Private Server) dengan **dua cara**:
1. **Supabase Version** — Frontend + Supabase Cloud (lebih mudah)
2. **Self-Hosted Version** — Frontend + Backend + PostgreSQL sendiri (tanpa vendor)

---

## 📋 DAFTAR ISI

1. [Persiapan VPS](#-1-persiapan-vps)
2. [Deploy: Supabase Version](#-2-deploy-supabase-version)
3. [Deploy: Self-Hosted Version](#-3-deploy-self-hosted-version)
4. [Setup Domain & SSL (HTTPS)](#-4-setup-domain--ssl-https)
5. [Development Lokal dengan Docker](#-5-development-lokal-dengan-docker)
6. [Mengedit Kode Sambil Pakai Docker Lokal](#-6-mengedit-kode-sambil-pakai-docker-lokal)
7. [Perintah Docker Penting](#-7-perintah-docker-penting)
8. [Troubleshooting](#-8-troubleshooting)

---

## 🖥️ 1. PERSIAPAN VPS

### Spesifikasi Minimum VPS

| Komponen | Supabase Version | Self-Hosted Version |
| -------- | ---------------- | ------------------- |
| RAM      | 1 GB             | 2 GB                |
| CPU      | 1 core           | 2 core              |
| Disk     | 10 GB            | 20 GB               |
| OS       | Ubuntu 22.04+    | Ubuntu 22.04+       |

### Install Docker di VPS

```bash
# 1. Login ke VPS via SSH
ssh username@ip-vps-kamu

# 2. Update system
sudo apt update && sudo apt upgrade -y

# 3. Install Docker
curl -fsSL https://get.docker.com | sh

# 4. Tambahkan user ke group docker (agar tidak perlu sudo)
sudo usermod -aG docker $USER

# 5. Logout dan login lagi agar group berlaku
exit
ssh username@ip-vps-kamu

# 6. Verifikasi Docker
docker --version
docker compose version
```

### Upload Proyek ke VPS

**Cara 1: Via Git (Recommended)**
```bash
# Di VPS:
git clone https://github.com/username-kamu/flower-marketplace.git
cd flower-marketplace
```

**Cara 2: Via SCP (upload langsung)**
```bash
# Di laptop kamu (PowerShell):
scp -r "C:\Users\HYPE AMD\Documents\Leaarning\Dev\Web\Flower_Marketplace" username@ip-vps:/home/username/flower-marketplace
```

---

## 🟢 2. DEPLOY: SUPABASE VERSION

### Kapan pakai ini?
- Kamu sudah punya akun Supabase
- Mau setup cepat (1 container saja)
- Mau database dikelola oleh Supabase (auto backup, auto scaling)

### Arsitektur di VPS

```
┌─────────────────────────────────────┐
│             VPS Kamu                 │
│                                      │
│  ┌──────────────────────────────┐   │       ┌────────────────────┐
│  │    Docker Container          │   │       │  Supabase Cloud    │
│  │                              │   │       │                    │
│  │    Next.js (Frontend)        │───────────│  Auth + Database   │
│  │    Port 3000                 │   │       │  (PostgreSQL)      │
│  │                              │   │       │                    │
│  └──────────────────────────────┘   │       └────────────────────┘
│                                      │
│  User akses: http://ip-vps:3000      │
└─────────────────────────────────────┘
```

### Langkah-Langkah

#### Langkah 1: Setup Supabase (Sekali Saja)

1. Buka https://supabase.com → Sign Up / Login
2. Klik **"New Project"**
3. Isi nama project, password database, pilih region terdekat (Singapore)
4. Tunggu project selesai dibuat (~2 menit)
5. Buka **SQL Editor** di dashboard Supabase
6. Copy-paste isi file `1-supabase-version/supabase/run-all-migrations.sql`
7. Klik **"Run"** → Tabel-tabel akan terbuat
8. Catat kredensial di **Settings → API**:
   - `Project URL` → nanti jadi `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → nanti jadi `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → nanti jadi `SUPABASE_SERVICE_ROLE_KEY`

#### Langkah 2: Konfigurasi Environment

```bash
# Masuk folder supabase version
cd flower-marketplace/1-supabase-version

# Copy template env
cp .env.example .env

# Edit dengan nilai dari Supabase dashboard
nano .env
```

Isi file `.env`:
```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...
```

#### Langkah 3: Build & Jalankan

```bash
# Build dan jalankan (pertama kali butuh ~3-5 menit)
docker compose up -d --build

# Cek status
docker compose ps

# Cek log kalau ada error
docker compose logs -f
```

#### Langkah 4: Verifikasi

```bash
# Test dari command line
curl http://localhost:3000

# Atau buka di browser:
# http://ip-vps-kamu:3000
```

✅ **Selesai!** Website sudah live di `http://ip-vps-kamu:3000`

---

## 🔵 3. DEPLOY: SELF-HOSTED VERSION

### Kapan pakai ini?
- Tidak mau tergantung Supabase (no vendor lock-in)
- Mau semua data di server sendiri
- Mau kontrol penuh atas database dan backend

### Arsitektur di VPS

```
┌──────────────────────────────────────────────────────────┐
│                       VPS Kamu                            │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                    Nginx                              │ │
│  │               Port 80 / 443                           │ │
│  │                                                       │ │
│  │     /          → Frontend (Next.js)                   │ │
│  │     /api       → Backend (Express.js)                 │ │
│  └─────────────────────┬─────────────────────────────────┘ │
│             ┌──────────┴──────────┐                        │
│             ▼                     ▼                        │
│  ┌─────────────────┐  ┌─────────────────┐                │
│  │   Frontend      │  │    Backend      │                │
│  │   Next.js       │  │    Express.js   │                │
│  │   Port 3000     │  │    Port 5000    │                │
│  └─────────────────┘  └────────┬────────┘                │
│                                │                          │
│                       ┌────────▼────────┐                │
│                       │   PostgreSQL    │                │
│                       │   Port 5432    │                │
│                       │   (Data kamu)   │                │
│                       └─────────────────┘                │
│                                                           │
│  User akses: http://ip-vps (port 80, lewat Nginx)        │
└──────────────────────────────────────────────────────────┘
```

### Langkah-Langkah

#### Langkah 1: Konfigurasi Environment

```bash
# Masuk folder selfhosted version
cd flower-marketplace/2-selfhosted-version

# Copy template env
cp .env.example .env

# Edit dengan password yang AMAN
nano .env
```

Isi file `.env`:
```dotenv
# Database — GANTI PASSWORD!
DB_USER=flower_user
DB_PASSWORD=GantiDenganPasswordYangKuat123!
DB_NAME=flower_marketplace
DATABASE_URL=postgresql://flower_user:GantiDenganPasswordYangKuat123!@postgres:5432/flower_marketplace

# JWT — GANTI SECRET! (minimal 32 karakter)
JWT_SECRET=ganti-dengan-string-random-panjang-minimal-32-karakter-ya
JWT_EXPIRES_IN=7d

# Server
NODE_ENV=production
PORT=5000
```

> ⚠️ **PENTING:** Jangan pakai password default! Gunakan password yang kuat.

#### Langkah 2: Build & Jalankan

```bash
# Build dan jalankan semua service (pertama kali butuh ~5-10 menit)
docker compose up -d --build

# Cek semua 4 service berjalan
docker compose ps
```

Harusnya muncul:
```
NAME              STATUS
flower_db         Up (healthy)
flower_backend    Up (healthy)
flower_frontend   Up
flower_nginx      Up
```

#### Langkah 3: Verifikasi

```bash
# Test frontend via Nginx
curl http://localhost

# Test backend API
curl http://localhost/api/products

# Test database
docker exec -it flower_db psql -U flower_user -d flower_marketplace -c "\dt"
```

#### Langkah 4: Buat Admin User

```bash
# Masuk ke database
docker exec -it flower_db psql -U flower_user -d flower_marketplace

# Di dalam psql, cek admin sudah ada:
SELECT id, email, role FROM users WHERE role = 'admin';

# Kalau belum ada, buat:
INSERT INTO users (email, password, full_name, role, is_verified)
VALUES ('admin@tukobunga.com', '$2b$10$xxxhash', 'Admin', 'admin', true);

# Keluar
\q
```

> Admin default sudah di-seed otomatis oleh `init.sql`:
> Email: `admin@flowermarket.com` / Password: `admin123456`

✅ **Selesai!** Website live di `http://ip-vps-kamu` (port 80)

---

## 🔐 4. SETUP DOMAIN & SSL (HTTPS)

### Menghubungkan Domain

1. Beli domain (contoh: `tukobunga.com`)
2. Di DNS manager, tambahkan record:
   ```
   Type: A
   Name: @
   Value: ip-vps-kamu
   TTL: 300
   ```
3. Tunggu propagasi DNS (~5-30 menit)

### Install SSL dengan Certbot (Self-Hosted Version)

```bash
# 1. Install Certbot
sudo apt install certbot -y

# 2. Stop Nginx dulu (karena certbot butuh port 80)
cd ~/flower-marketplace/2-selfhosted-version
docker compose stop nginx

# 3. Generate sertifikat SSL
sudo certbot certonly --standalone -d tukobunga.com -d www.tukobunga.com

# 4. Copy sertifikat ke folder nginx
sudo cp /etc/letsencrypt/live/tukobunga.com/fullchain.pem nginx/certs/
sudo cp /etc/letsencrypt/live/tukobunga.com/privkey.pem nginx/certs/

# 5. Uncomment bagian HTTPS di nginx/nginx.conf
nano nginx/nginx.conf
# Uncomment server block untuk port 443

# 6. Restart Nginx
docker compose up -d nginx
```

### Install SSL (Supabase Version)

Untuk Supabase version yang hanya punya 1 container, gunakan reverse proxy terpisah:

```bash
# Install Caddy (otomatis HTTPS)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy -y

# Buat Caddyfile
echo "tukobunga.com {
    reverse_proxy localhost:3000
}" | sudo tee /etc/caddy/Caddyfile

# Restart Caddy
sudo systemctl restart caddy
```

Caddy otomatis mengurus SSL certificate! Website langsung bisa diakses via `https://tukobunga.com`

---

## 🖥️ 5. DEVELOPMENT LOKAL DENGAN DOCKER

### Kenapa Pakai Docker di Lokal?

**Tanpa Docker:**
- Harus install PostgreSQL di laptop
- Harus install Supabase CLI (berat ~2GB)
- Konfigurasi manual rumit
- "Di laptop saya jalan, di VPS tidak" (environment berbeda)

**Dengan Docker:**
- Cukup install Docker Desktop saja
- Semua dependency terisolasi dalam container
- Environment sama persis dengan production
- Stop container = bersih, tidak ada sisa di laptop

### Cara 1: Docker untuk Development Supabase Version

Ini yang paling simpel — karena Supabase sudah di cloud, kamu cuma perlu Next.js:

```powershell
# Di laptop, folder web/
cd web
npm install
npm run dev
```

Tidak butuh Docker sama sekali untuk development Supabase version. Langsung `npm run dev`.

### Cara 2: Docker untuk Development Self-Hosted Version (PostgreSQL Lokal)

**Ini yang kamu butuhkan kalau tidak mau install Supabase/PostgreSQL manual di laptop.**

```powershell
# Di laptop, masuk folder selfhosted
cd "2-selfhosted-version"

# Copy environment
copy .env.example .env

# Jalankan HANYA database dan backend (frontend tetap pakai npm run dev)
docker compose up -d postgres backend
```

Lalu di terminal lain:
```powershell
# Jalankan frontend secara lokal (agar bisa hot-reload saat edit)
cd ..\web
npm run dev
```

Sekarang:
- PostgreSQL jalan di Docker (port 5432) — tidak perlu install di laptop
- Backend jalan di Docker (port 5000)
- Frontend jalan lokal (port 3000) dengan hot-reload

### Cara 3: Docker Compose FULL (Simulasi Production)

Kalau mau test persis seperti di VPS sebelum deploy:

```powershell
# Self-hosted full stack
cd "2-selfhosted-version"
copy .env.example .env
docker compose up --build

# Buka http://localhost (via Nginx, port 80)
```

Atau Supabase version:
```powershell
cd "1-supabase-version"
copy .env.example .env
# Isi .env dengan kredensial Supabase
docker compose up --build

# Buka http://localhost:3000
```

---

## ✏️ 6. MENGEDIT KODE SAMBIL PAKAI DOCKER LOKAL

### Pertanyaan: "Apakah saya bisa edit kode dan langsung lihat perubahannya?"

**Ya!** Ada dua cara:

### Cara A: Frontend Lokal + Backend di Docker (RECOMMENDED)

```
┌──────────────────────────────────────────────────┐
│  Laptop Kamu                                      │
│                                                    │
│  Terminal 1 (Docker):                              │
│  ┌────────────────┐  ┌────────────────┐           │
│  │  PostgreSQL    │  │  Backend       │           │
│  │  (container)   │  │  (container)   │           │
│  │  port 5432     │  │  port 5000     │           │
│  └────────────────┘  └────────────────┘           │
│                                                    │
│  Terminal 2 (npm run dev):                         │
│  ┌──────────────────────────────────────────┐     │
│  │  Next.js Frontend (LOKAL, bukan Docker)  │     │
│  │  port 3000                                │     │
│  │                                           │     │
│  │  ✅ Hot-reload: edit → simpan → otomatis  │     │
│  │     ter-refresh di browser                │     │
│  └──────────────────────────────────────────┘     │
│                                                    │
│  VS Code: Edit file di web/src/ → langsung terlihat│
└──────────────────────────────────────────────────┘
```

**Langkah:**
```powershell
# Terminal 1: Jalankan DB + Backend di Docker
cd "c:\Users\HYPE AMD\Documents\Leaarning\Dev\Web\Flower_Marketplace\2-selfhosted-version"
copy .env.example .env
docker compose up -d postgres backend

# Terminal 2: Jalankan Frontend lokal (hot-reload)
cd "c:\Users\HYPE AMD\Documents\Leaarning\Dev\Web\Flower_Marketplace\web"
npm run dev
```

Sekarang edit file apa saja di `web/src/` → simpan → browser otomatis refresh!

### Cara B: Semua di Docker dengan Volume Mount

Kalau kamu mau semuanya di Docker TAPI tetap bisa edit:

Tambahkan volume mount di docker-compose.yml (self-hosted):

```yaml
frontend:
  build:
    context: ../web
    dockerfile: Dockerfile
  volumes:
    - ../web/src:/app/src      # ← Mount source code 
    - ../web/public:/app/public
  environment:
    - NODE_ENV=development     # ← Development mode
```

Tapi **Cara A lebih disarankan** karena:
- Hot-reload lebih cepat
- Tidak perlu rebuild Docker saat edit
- Error messages lebih jelas

### Workflow Harian untuk Development

```
1. Buka VS Code di folder Flower_Marketplace
2. Buka terminal:
   - Jalankan Docker (kalau pakai self-hosted backend):
     cd 2-selfhosted-version && docker compose up -d postgres backend
   
   - Jalankan frontend:
     cd web && npm run dev

3. Edit kode di web/src/ → browser auto-refresh
4. Selesai coding? Stop semuanya:
   cd 2-selfhosted-version && docker compose down
   # Ctrl+C di terminal frontend
```

---

## 🔧 7. PERINTAH DOCKER PENTING

### Operasi Dasar

```bash
# Jalankan (background)
docker compose up -d

# Jalankan + rebuild (setelah edit Dockerfile)
docker compose up -d --build

# Stop semua container
docker compose down

# Stop + hapus data database (HATI-HATI!)
docker compose down -v

# Lihat container yang jalan
docker compose ps

# Lihat log semua service
docker compose logs -f

# Lihat log service tertentu
docker compose logs -f backend
docker compose logs -f postgres
```

### Database

```bash
# Masuk ke PostgreSQL
docker exec -it flower_db psql -U flower_user -d flower_marketplace

# Lihat semua tabel
\dt

# Lihat isi tabel users
SELECT id, email, role FROM users;

# Lihat isi tabel products  
SELECT id, name, price FROM products LIMIT 10;

# Keluar
\q

# Backup database
docker exec flower_db pg_dump -U flower_user flower_marketplace > backup.sql

# Restore database dari backup
docker exec -i flower_db psql -U flower_user flower_marketplace < backup.sql
```

### Debugging

```bash
# Masuk ke dalam container
docker exec -it flower_backend sh
docker exec -it flower_frontend sh

# Cek resource usage
docker stats

# Restart satu service
docker compose restart backend

# Rebuild satu service
docker compose up -d --build backend
```

---

## 🔥 8. TROUBLESHOOTING

### Error: "Port already in use"

```bash
# Cek siapa yang pakai port
sudo lsof -i :3000
sudo lsof -i :5000

# Atau di PowerShell (Windows):
netstat -aon | findstr :3000

# Kill process
sudo kill -9 <PID>
# Atau Windows:
taskkill /PID <PID> /F
```

### Error: "Database connection refused"

```bash
# Cek apakah PostgreSQL jalan
docker compose ps postgres
docker compose logs postgres

# Kalau belum healthy, tunggu ~10 detik lalu cek lagi
# PostgreSQL butuh waktu init pertama kali
```

### Error: "Cannot find module" di backend

```bash
# Rebuild backend
docker compose up -d --build backend
```

### Container tidak mau start

```bash
# Lihat error detail
docker compose logs --tail=50

# Hapus semua dan mulai ulang
docker compose down -v
docker compose up -d --build
```

### Website lambat di VPS

```bash
# Cek RAM usage
free -h

# Cek disk
df -h

# Kalau RAM kurang, kurangi container yang jalan
# atau upgrade VPS
```

### Perlu update kode di VPS

```bash
# Cara 1: Via Git
cd ~/flower-marketplace
git pull origin main
docker compose -f 2-selfhosted-version/docker-compose.yml up -d --build

# Cara 2: Via SCP (upload ulang)
# Di laptop:
scp -r web/ username@ip-vps:/home/username/flower-marketplace/web/
# Di VPS:
docker compose up -d --build
```

---

## 📊 RINGKASAN: Mana yang Harus Dipilih?

| Skenario | Pilih |
| -------- | ----- |
| Baru belajar, mau cepat jalan | **Supabase Version** |
| Mau deploy tanpa ribet | **Supabase Version** |
| Mau kontrol penuh, data di server sendiri | **Self-Hosted Version** |
| Projek skala besar, butuh custom backend | **Self-Hosted Version** |
| Development sehari-hari | `cd web && npm run dev` (Supabase) |
| Test seperti production sebelum deploy | Docker Compose (salah satu version) |

---

## 🎯 CHECKLIST SEBELUM DEPLOY

### Keamanan
- [ ] Ganti semua password default di `.env`
- [ ] Generate JWT_SECRET yang kuat (32+ karakter)
- [ ] Setup HTTPS (SSL certificate)
- [ ] Konfigurasi firewall (hanya buka port 80, 443)
- [ ] Jangan expose port 5432 (database) ke internet

### Performa
- [ ] Enable gzip di Nginx ✅ (sudah ada di config)
- [ ] Pastikan `NODE_ENV=production` di environment
- [ ] Setup CDN untuk static assets (opsional)

### Monitoring
- [ ] Setup monitoring uptime (contoh: UptimeRobot, gratis)
- [ ] Konfigurasi log rotation
- [ ] Setup auto backup database (cron job)

### Auto Backup Database (Self-Hosted)
```bash
# Buat script backup
cat > ~/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/backups
mkdir -p $BACKUP_DIR
docker exec flower_db pg_dump -U flower_user flower_marketplace | gzip > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql.gz
# Hapus backup lebih dari 7 hari
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
EOF

chmod +x ~/backup-db.sh

# Schedule backup otomatis setiap hari jam 2 pagi
(crontab -l 2>/dev/null; echo "0 2 * * * ~/backup-db.sh") | crontab -
```

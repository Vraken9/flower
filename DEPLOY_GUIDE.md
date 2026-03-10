# 📖 Panduan Deploy Flower Marketplace

Dokumen ini menjelaskan langkah-langkah detail untuk deploy aplikasi Flower Marketplace ke VPS. Ada **dua pilihan** deployment:

| Pilihan | Cocok Untuk | Kesulitan | Biaya |
|---------|-------------|-----------|-------|
| **Supabase** | Pemula, MVP, startup | ⭐ Mudah | $0-25/bulan |
| **Self-Hosted** | Developer berpengalaman, kontrol penuh | ⭐⭐⭐ Menengah | $5-20/bulan (VPS) |

---

## 📋 Daftar Isi

1. [Prasyarat](#-prasyarat)
2. [Opsi A: Deploy dengan Supabase](#-opsi-a-deploy-dengan-supabase)
3. [Opsi B: Deploy Self-Hosted](#-opsi-b-deploy-self-hosted)
4. [Setup Domain & SSL](#-setup-domain--ssl)
5. [Troubleshooting](#-troubleshooting)
6. [Maintenance](#-maintenance)

---

## 🔧 Prasyarat

### Kebutuhan VPS
- **OS**: Ubuntu 20.04+ atau Debian 11+
- **RAM**: Minimal 1GB (rekomendasi 2GB)
- **Storage**: Minimal 20GB
- **Akses**: SSH root atau sudo

### Software yang Perlu Diinstall

```bash
# 1. Update sistem
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 3. Install Docker Compose
sudo apt install docker-compose-plugin -y

# 4. Install Git
sudo apt install git -y

# 5. Logout dan login ulang agar docker group aktif
exit
# SSH kembali ke server
```

### Verifikasi Instalasi
```bash
docker --version        # Docker version 24.x+
docker compose version  # Docker Compose version v2.x+
git --version          # git version 2.x+
```

---

## ☁️ OPSI A: Deploy dengan Supabase

**Arsitektur:**
```
┌─────────────────────────────────────────┐
│              Your VPS                    │
│  ┌─────────────────────────────────┐    │
│  │   Next.js Container (Port 3000) │    │
│  └──────────────┬──────────────────┘    │
└─────────────────┼───────────────────────┘
                  │ HTTPS
                  ▼
        ┌─────────────────────┐
        │   Supabase Cloud    │
        │  (Auth + Database)  │
        └─────────────────────┘
```

### Langkah 1: Setup Supabase Project

1. **Buat Akun Supabase**
   - Buka https://supabase.com
   - Sign up dengan GitHub/Email

2. **Buat Project Baru**
   - Klik "New Project"
   - Isi nama project: `flower-marketplace`
   - Pilih region terdekat (Singapore untuk Indonesia)
   - Buat password database (simpan baik-baik!)
   - Tunggu ~2 menit sampai project ready

3. **Dapatkan Kredensial**
   - Buka Project Settings → API
   - Catat:
     - `Project URL` → NEXT_PUBLIC_SUPABASE_URL
     - `anon public` key → NEXT_PUBLIC_SUPABASE_ANON_KEY
     - `service_role` key → SUPABASE_SERVICE_ROLE_KEY

4. **Jalankan Migrations**
   - Buka SQL Editor di Supabase Dashboard
   - Copy-paste isi file berikut secara berurutan:
     1. `supabase/migrations/001_create_roles_profiles_shops_products.sql`
     2. `supabase/migrations/002_enable_rls_and_policies.sql`
     3. `supabase/migrations/003_owner_onboarding_applications.sql`
   - Klik "Run" untuk setiap file

### Langkah 2: Clone Repository ke VPS

```bash
# SSH ke VPS
ssh root@your-vps-ip

# Clone repository
cd /opt
git clone https://github.com/YOUR_USERNAME/flower-marketplace.git
cd flower-marketplace
```

### Langkah 3: Konfigurasi Environment

```bash
# Copy template environment
cp .env.example .env

# Edit file .env
nano .env
```

Isi dengan kredensial Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Simpan: `Ctrl+X` → `Y` → `Enter`

### Langkah 4: Build dan Jalankan

```bash
# Build dan jalankan container
docker compose -f docker-compose.supabase.yml up -d --build

# Cek status
docker compose -f docker-compose.supabase.yml ps

# Lihat logs
docker compose -f docker-compose.supabase.yml logs -f
```

### Langkah 5: Verifikasi

```bash
# Test dari dalam server
curl http://localhost:3000

# Atau buka di browser
http://YOUR_VPS_IP:3000
```

### ✅ Selesai untuk Supabase!

Aplikasi berjalan di `http://YOUR_VPS_IP:3000`

---

## 🖥️ OPSI B: Deploy Self-Hosted

**Arsitektur:**
```
┌──────────────────────────────────────────────────────────┐
│                        Your VPS                           │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                  Nginx (Port 80/443)                 │ │
│  │            Reverse Proxy + SSL Termination           │ │
│  └─────────────────────┬───────────────────────────────┘ │
│              ┌─────────┴─────────┐                       │
│              ▼                   ▼                       │
│  ┌─────────────────┐   ┌─────────────────┐              │
│  │    Frontend     │   │     Backend     │              │
│  │    Next.js      │   │    Express.js   │              │
│  │   Port 3000     │   │    Port 5000    │              │
│  └─────────────────┘   └────────┬────────┘              │
│                                 │                        │
│                        ┌────────▼────────┐              │
│                        │   PostgreSQL    │              │
│                        │   Port 5432     │              │
│                        │  (Internal)     │              │
│                        └─────────────────┘              │
└──────────────────────────────────────────────────────────┘
```

### Langkah 1: Clone Repository ke VPS

```bash
# SSH ke VPS
ssh root@your-vps-ip

# Clone repository
cd /opt
git clone https://github.com/YOUR_USERNAME/flower-marketplace.git
cd flower-marketplace
```

### Langkah 2: Buat SSL Certificate Directory (Opsional)

```bash
# Buat folder untuk SSL certificates
mkdir -p nginx/certs

# Jika belum punya SSL, buat self-signed (untuk testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/certs/privkey.pem \
  -out nginx/certs/fullchain.pem \
  -subj "/CN=localhost"
```

### Langkah 3: Konfigurasi Environment

```bash
# Copy template environment
cp .env.selfhosted.example .env

# Edit file .env
nano .env
```

**PENTING:** Ganti semua password default!

```env
# ========== DATABASE ==========
DB_USER=flower_user
DB_PASSWORD=GantiDenganPasswordYangKuat123!
DB_NAME=flower_marketplace
DATABASE_URL=postgresql://flower_user:GantiDenganPasswordYangKuat123!@postgres:5432/flower_marketplace

# ========== JWT ==========
# Generate dengan: openssl rand -base64 32
JWT_SECRET=abcdefghijklmnopqrstuvwxyz123456789ABCDEF
JWT_EXPIRES_IN=7d

# ========== SERVER ==========
NODE_ENV=production
PORT=5000
```

Simpan: `Ctrl+X` → `Y` → `Enter`

### Langkah 4: Build dan Jalankan Semua Service

```bash
# Build dan jalankan semua container
docker compose -f docker-compose.selfhosted.yml up -d --build

# Ini akan menjalankan:
# - PostgreSQL database
# - Express.js backend
# - Next.js frontend
# - Nginx reverse proxy
```

### Langkah 5: Cek Status Semua Service

```bash
# Lihat status container
docker compose -f docker-compose.selfhosted.yml ps

# Output yang diharapkan:
# NAME              STATUS          PORTS
# flower_db         Up (healthy)    5432/tcp
# flower_backend    Up (healthy)    5000/tcp
# flower_frontend   Up              3000/tcp
# flower_nginx      Up              0.0.0.0:80->80/tcp
```

### Langkah 6: Verifikasi Setiap Service

```bash
# 1. Test Database
docker exec -it flower_db psql -U flower_user -d flower_marketplace -c "SELECT COUNT(*) FROM users;"

# 2. Test Backend API
curl http://localhost:5000
# Expected: {"message":"🌸 Flower Marketplace API","version":"1.0.0",...}

# 3. Test Frontend
curl http://localhost:3000
# Expected: HTML content

# 4. Test via Nginx
curl http://localhost
# Expected: HTML content (same as frontend)
```

### Langkah 7: Akses Aplikasi

```bash
# Buka di browser
http://YOUR_VPS_IP

# API endpoint
http://YOUR_VPS_IP/api
```

### ✅ Selesai untuk Self-Hosted!

---

## 🔒 Setup Domain & SSL

### Langkah 1: Pointing Domain

Di DNS provider Anda (Cloudflare, Namecheap, dll):
```
Type: A
Name: @ (atau subdomain)
Value: YOUR_VPS_IP
TTL: Auto
```

### Langkah 2: Install Certbot

```bash
# Install Certbot
sudo apt install certbot -y

# Stop Nginx sementara
docker compose -f docker-compose.selfhosted.yml stop nginx

# Generate SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates ke folder project
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/certs/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/certs/
sudo chown -R $USER:$USER nginx/certs/
```

### Langkah 3: Update Nginx Config

Edit `nginx/nginx.conf`:
```bash
nano nginx/nginx.conf
```

Uncomment bagian HTTPS dan ganti `yourdomain.com`:
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;

    # ... location blocks ...
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Langkah 4: Restart Nginx

```bash
docker compose -f docker-compose.selfhosted.yml up -d nginx
```

### Langkah 5: Auto-Renew SSL

```bash
# Buat script renewal
cat > /opt/flower-marketplace/renew-ssl.sh << 'EOF'
#!/bin/bash
cd /opt/flower-marketplace
docker compose -f docker-compose.selfhosted.yml stop nginx
certbot renew --quiet
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/certs/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/certs/
docker compose -f docker-compose.selfhosted.yml start nginx
EOF

chmod +x /opt/flower-marketplace/renew-ssl.sh

# Tambahkan ke crontab (renew setiap bulan)
(crontab -l 2>/dev/null; echo "0 3 1 * * /opt/flower-marketplace/renew-ssl.sh") | crontab -
```

---

## 🔧 Troubleshooting

### Container Tidak Mau Start

```bash
# Lihat logs detail
docker compose -f docker-compose.selfhosted.yml logs backend
docker compose -f docker-compose.selfhosted.yml logs frontend

# Cek disk space
df -h

# Cek memory
free -m
```

### Database Connection Error

```bash
# Cek apakah database running
docker compose -f docker-compose.selfhosted.yml ps postgres

# Test koneksi manual
docker exec -it flower_db psql -U flower_user -d flower_marketplace

# Reset database (HATI-HATI: menghapus semua data!)
docker compose -f docker-compose.selfhosted.yml down -v
docker compose -f docker-compose.selfhosted.yml up -d
```

### Port Already in Use

```bash
# Cari proses yang menggunakan port
sudo lsof -i :80
sudo lsof -i :3000
sudo lsof -i :5000

# Kill proses jika perlu
sudo kill -9 <PID>
```

### Frontend Error 500

```bash
# Cek environment variables
docker exec flower_frontend env | grep NEXT

# Rebuild frontend
docker compose -f docker-compose.selfhosted.yml up -d --build frontend
```

### Backend Tidak Bisa Connect ke Database

```bash
# Cek network
docker network ls
docker network inspect flower-marketplace_default

# Cek apakah container dalam network yang sama
docker inspect flower_backend | grep NetworkMode
docker inspect flower_db | grep NetworkMode
```

---

## 🛠️ Maintenance

### Update Aplikasi

```bash
cd /opt/flower-marketplace

# Pull perubahan terbaru
git pull origin main

# Rebuild dan restart
docker compose -f docker-compose.selfhosted.yml up -d --build
```

### Backup Database

```bash
# Backup
docker exec flower_db pg_dump -U flower_user flower_marketplace > backup_$(date +%Y%m%d).sql

# Restore
cat backup_20260310.sql | docker exec -i flower_db psql -U flower_user -d flower_marketplace
```

### Monitoring

```bash
# Lihat resource usage
docker stats

# Lihat logs real-time
docker compose -f docker-compose.selfhosted.yml logs -f --tail=100
```

### Cleanup

```bash
# Hapus container yang tidak dipakai
docker system prune -f

# Hapus images yang tidak dipakai
docker image prune -a -f

# Hapus volumes yang tidak dipakai (HATI-HATI!)
docker volume prune -f
```

---

## 📊 Perbandingan Kedua Opsi

| Aspek | Supabase | Self-Hosted |
|-------|----------|-------------|
| **Waktu Setup** | 30-60 menit | 1-2 jam |
| **Kompleksitas** | Rendah | Menengah |
| **Biaya Bulanan** | $0 (free tier) - $25 | $5-20 (VPS) |
| **Kontrol Data** | Di cloud Supabase | Di VPS Anda |
| **Backup** | Otomatis | Manual |
| **Scaling** | Otomatis | Manual |
| **Maintenance** | Minimal | Rutin |
| **Vendor Lock-in** | Ya | Tidak |

### Rekomendasi:

- **Pilih Supabase** jika:
  - Baru belajar deployment
  - Butuh cepat launch
  - Tim kecil tanpa DevOps
  - Project MVP/prototype

- **Pilih Self-Hosted** jika:
  - Butuh kontrol penuh data
  - Regulasi data ketat (GDPR, dll)
  - Budget terbatas jangka panjang
  - Tim punya skill DevOps

---

## ❓ FAQ

**Q: Bisa switch dari Supabase ke Self-Hosted?**
A: Ya, tapi perlu migrasi data. Export dari Supabase, import ke PostgreSQL lokal.

**Q: Apakah perlu 2 VPS?**
A: Tidak. Satu VPS cukup untuk semua service (frontend, backend, database, nginx).

**Q: Berapa minimal RAM yang dibutuhkan?**
A: 1GB untuk development, 2GB+ untuk production.

**Q: Bagaimana dengan file upload/gambar?**
A: Supabase punya Storage. Self-hosted bisa pakai folder lokal atau S3-compatible storage.

---

## 📞 Bantuan

Jika mengalami masalah:

1. Cek logs: `docker compose logs -f`
2. Cek issue di GitHub repository
3. Buat issue baru dengan detail error

---

*Terakhir diupdate: Maret 2026*

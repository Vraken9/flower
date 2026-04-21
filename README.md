# Bloom — Marketplace Bunga

Marketplace bunga online yang menghubungkan pembeli dengan florist lokal terpercaya. Dibangun menggunakan **Next.js 16**, **Supabase**, dan **TypeScript**.

Bloom menyediakan platform multi-peran di mana pembeli dapat menemukan dan membeli rangkaian bunga, pemilik toko dapat mengelola etalase dan produk mereka, serta administrator mengawasi seluruh marketplace — semuanya diamankan dengan Row Level Security pada level database.

## Fitur

**Untuk Pembeli**
- Jelajahi dan cari produk bunga dari berbagai toko
- Tambahkan item ke keranjang dengan kalkulasi total secara real-time
- Simpan produk favorit untuk dilihat nanti
- Berikan ulasan dan rating pada produk yang dibeli
- Lacak status pesanan melalui integrasi WhatsApp

**Untuk Pemilik Toko**
- Dashboard lengkap untuk mengelola produk, stok, dan harga
- Kustomisasi profil toko dengan kategori dan lokasi cabang
- Analitik penjualan dan manajemen pesanan
- Ajukan status pemilik toko melalui alur pendaftaran yang mudah

**Untuk Admin**
- Panel admin terpusat dengan analitik seluruh marketplace
- Manajemen pengguna dan penetapan peran
- Tinjau dan setujui pengajuan pemilik toko
- Moderasi kategori dan produk

## Teknologi yang Digunakan

| Lapisan | Teknologi |
|---------|-----------|
| Framework | Next.js 16 (App Router) |
| Bahasa | TypeScript 5 |
| UI | React 19, Tailwind CSS 4, Framer Motion |
| Ikon | Lucide React |
| Auth & DB | Supabase (Auth, PostgreSQL, RLS, Storage) |
| State | Zustand (keranjang), React Context (auth, favorit) |
| Validasi | Zod |
| Grafik | Recharts |
| Testing | Vitest |

## Cara Memulai

### Prasyarat

- [Node.js](https://nodejs.org/) v20 atau lebih baru
- Proyek [Supabase](https://supabase.com/) (paket gratis sudah cukup)

### Instalasi

```bash
git clone https://github.com/Vraken9/flower.git
cd flower/web
cp .env.example .env.local
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) untuk melihat aplikasi.

> [!IMPORTANT]
> Anda harus mengisi kredensial Supabase di `.env.local` sebelum menjalankan aplikasi. Lihat bagian [Variabel Lingkungan](#variabel-lingkungan) di bawah.

## Variabel Lingkungan

Buat file `.env.local` di dalam direktori `web/`:

| Variabel | Deskripsi |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL proyek Supabase Anda |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Kunci anon/publik Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Kunci service role Supabase (hanya sisi server) |

> [!WARNING]
> Jangan pernah melakukan commit `.env.local` atau mengekspos `SUPABASE_SERVICE_ROLE_KEY` di kode sisi klien.

## Struktur Proyek

```
web/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── admin/           # Dashboard & manajemen admin
│   │   ├── api/             # Route API (auth, keranjang, ulasan, dll.)
│   │   ├── auth/            # Halaman autentikasi
│   │   ├── cart/            # Halaman keranjang belanja
│   │   ├── dashboard/       # Dashboard pemilik toko
│   │   ├── favorites/       # Produk tersimpan
│   │   ├── products/        # Katalog & detail produk
│   │   ├── shops/           # Daftar toko & profil
│   │   └── page.tsx         # Halaman utama
│   ├── components/          # Komponen React yang dapat digunakan ulang
│   │   ├── ui/              # Komponen UI dasar
│   │   ├── layout/          # Navbar, Footer
│   │   ├── home/            # Hero, bagian unggulan
│   │   ├── product/         # Kartu produk, grid
│   │   ├── shop/            # Kartu toko, detail
│   │   ├── cart/            # Komponen keranjang
│   │   └── dashboard/       # Widget dashboard pemilik
│   └── lib/                 # Utilitas & logika bersama
│       ├── api/             # Helper API sisi server
│       ├── contexts/        # Provider React Context
│       ├── store/           # Store Zustand
│       ├── supabase/        # Klien Supabase (server & browser)
│       └── types/           # Definisi tipe TypeScript
├── supabase-migrations/     # File migrasi SQL
├── public/                  # Aset statis
└── Dockerfile               # Build Docker multi-stage
```

## Skrip yang Tersedia

Jalankan perintah berikut dari direktori `web/`:

```bash
npm run dev                  # Jalankan server pengembangan
npm run build                # Build untuk produksi
npm run start                # Jalankan server produksi
npm run lint                 # Jalankan ESLint
npm test                     # Jalankan unit test
npm run test:integration     # Jalankan integration test
```

## Deployment

File `Dockerfile` multi-stage sudah disertakan untuk deployment berbasis container:

```bash
cd web
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=<url-anda> \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=<kunci-anda> \
  -t bloom .
docker run -p 3000:3000 bloom
```

> [!NOTE]
> Image Docker menggunakan `node:20-alpine` dan berjalan sebagai pengguna non-root untuk keamanan. Lihat `web/Dockerfile` untuk konfigurasi lengkap.

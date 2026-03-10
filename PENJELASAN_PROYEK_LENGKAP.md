# 📖 Penjelasan Lengkap Proyek Flower Marketplace

Dokumen ini menjelaskan **setiap folder dan file** dalam proyek, kegunaannya, alur logikanya, dan bagaimana semuanya saling terhubung.

---

## 📋 DAFTAR ISI

1. [Struktur Proyek Lengkap](#-struktur-proyek-lengkap)
2. [Penjelasan Folder Root](#-1-folder-root)
3. [Folder web/ — Frontend](#-2-folder-web--frontend-nextjs)
4. [Folder 1-supabase-version/](#-3-folder-1-supabase-version)
5. [Folder 2-selfhosted-version/](#-4-folder-2-selfhosted-version)
6. [Alur Data & Flow Aplikasi](#-5-alur-data--flow-aplikasi)
7. [Cara Menjalankan Lokal](#-6-cara-menjalankan-di-lokal)
8. [Tabel Ringkasan Semua File](#-7-tabel-ringkasan-semua-file)

---

## 🌳 STRUKTUR PROYEK LENGKAP

```
Flower_Marketplace/
│
├── web/                              ← 🎨 FRONTEND (kode utama, edit di sini)
│   ├── src/
│   │   ├── app/                      ← Halaman-halaman website
│   │   │   ├── layout.tsx            ← Template utama (navbar + footer)
│   │   │   ├── page.tsx              ← Homepage
│   │   │   ├── globals.css           ← CSS global (Tailwind)
│   │   │   ├── actions/auth.ts       ← Server action untuk auth
│   │   │   │
│   │   │   ├── auth/                 ← 🔐 Halaman Login & Register
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   │
│   │   │   ├── products/             ← 🌹 Halaman Produk
│   │   │   │   ├── page.tsx          ← Daftar semua produk
│   │   │   │   └── [id]/page.tsx     ← Detail 1 produk
│   │   │   │
│   │   │   ├── shops/                ← 🏪 Halaman Toko
│   │   │   │   ├── page.tsx          ← Daftar semua toko
│   │   │   │   └── [id]/page.tsx     ← Detail 1 toko
│   │   │   │
│   │   │   ├── cart/page.tsx         ← 🛒 Keranjang belanja
│   │   │   ├── favorites/page.tsx    ← ❤️ Produk favorit
│   │   │   ├── profile/page.tsx      ← 👤 Profil pengguna
│   │   │   ├── apply-owner/page.tsx  ← 📋 Daftar jadi pemilik toko
│   │   │   │
│   │   │   ├── dashboard/            ← 📊 Dashboard Owner & Admin
│   │   │   │   ├── layout.tsx        ← Template dashboard (sidebar)
│   │   │   │   ├── page.tsx          ← Halaman utama dashboard
│   │   │   │   ├── analytics/        ← Statistik & grafik
│   │   │   │   ├── products/         ← Kelola produk
│   │   │   │   │   ├── page.tsx      ← Daftar produk saya
│   │   │   │   │   ├── new/          ← Tambah produk baru (owner)
│   │   │   │   │   ├── admin-new/    ← Tambah produk (admin)
│   │   │   │   │   └── [id]/edit/    ← Edit produk
│   │   │   │   ├── shop/page.tsx     ← Kelola toko saya (owner)
│   │   │   │   ├── shops/page.tsx    ← Kelola semua toko (admin)
│   │   │   │   └── applications/     ← Review pendaftaran owner
│   │   │   │
│   │   │   ├── admin/                ← 👑 Halaman Admin
│   │   │   │   ├── page.tsx          ← Panel admin
│   │   │   │   └── applications/     ← Daftar aplikasi owner
│   │   │   │
│   │   │   ├── help/                 ← ❓ Halaman bantuan
│   │   │   │   ├── cara-belanja/     ← Panduan belanja
│   │   │   │   ├── ketentuan/        ← Syarat & ketentuan
│   │   │   │   └── privasi/          ← Kebijakan privasi
│   │   │   │
│   │   │   └── api/                  ← 🔌 API Routes (backend di Next.js)
│   │   │       ├── cart/route.ts          ← CRUD keranjang
│   │   │       ├── favorites/route.ts     ← CRUD favorit
│   │   │       ├── applications/          ← Pendaftaran owner
│   │   │       │   ├── route.ts
│   │   │       │   ├── my-status/route.ts
│   │   │       │   └── [id]/review/route.ts
│   │   │       ├── owner/                 ← API untuk owner
│   │   │       │   ├── shop/route.ts
│   │   │       │   ├── products/route.ts
│   │   │       │   ├── products/[id]/route.ts
│   │   │       │   └── dashboard-stats/route.ts
│   │   │       ├── admin/                 ← API untuk admin
│   │   │       │   ├── analytics/route.ts
│   │   │       │   ├── products/route.ts
│   │   │       │   └── shops/...
│   │   │       ├── tracking/              ← Analytics tracking
│   │   │       │   ├── product-view/route.ts
│   │   │       │   ├── shop-view/route.ts
│   │   │       │   └── whatsapp-click/route.ts
│   │   │       ├── profile/ensure/route.ts ← Pastikan profil ada
│   │   │       └── test-db/route.ts        ← Tes koneksi database
│   │   │
│   │   ├── components/               ← 🧩 Komponen UI
│   │   │   ├── layout/
│   │   │   │   ├── navbar.tsx        ← Menu navigasi atas
│   │   │   │   └── footer.tsx        ← Footer bawah
│   │   │   ├── home/
│   │   │   │   ├── hero-section.tsx  ← Banner utama homepage
│   │   │   │   ├── featured-products.tsx ← Produk unggulan
│   │   │   │   └── featured-shops.tsx    ← Toko unggulan
│   │   │   ├── product/
│   │   │   │   ├── product-card.tsx  ← Kartu produk (gambar+harga)
│   │   │   │   ├── product-detail.tsx ← Detail produk (full)
│   │   │   │   └── product-grid.tsx  ← Grid daftar produk
│   │   │   ├── shop/
│   │   │   │   ├── shop-card.tsx     ← Kartu toko
│   │   │   │   ├── shop-grid.tsx     ← Grid daftar toko
│   │   │   │   └── shop-view-tracker.tsx ← Tracking view toko
│   │   │   ├── auth/
│   │   │   │   ├── auth-forms.tsx    ← Form login/register
│   │   │   │   └── protected-route.tsx ← Proteksi halaman
│   │   │   ├── cart/
│   │   │   │   ├── add-to-cart-button.tsx ← Tombol tambah ke keranjang
│   │   │   │   └── cart-view.tsx     ← Tampilan isi keranjang
│   │   │   ├── favorites/
│   │   │   │   └── favorite-button.tsx ← Tombol ❤️ favorit
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard-stats.tsx    ← Statistik dashboard
│   │   │   │   ├── product-form.tsx       ← Form tambah/edit produk
│   │   │   │   ├── shop-form.tsx          ← Form toko
│   │   │   │   └── delete-product-button.tsx ← Tombol hapus produk
│   │   │   └── ui/                   ← Komponen dasar (reusable)
│   │   │       ├── button.tsx        ← Tombol (styled)
│   │   │       ├── input.tsx         ← Input field (styled)
│   │   │       └── skeleton.tsx      ← Loading placeholder
│   │   │
│   │   ├── lib/                      ← 📚 Library & Utilities
│   │   │   ├── types.ts             ← Tipe data (Shop, Product, dll)
│   │   │   ├── types/auth.ts        ← Tipe auth (User, roles, permissions)
│   │   │   ├── utils.ts             ← Helper: formatPrice, formatDate, cn
│   │   │   │
│   │   │   ├── supabase/            ← 🔗 Koneksi ke Supabase
│   │   │   │   ├── client.ts        ← Client browser (RLS berlaku)
│   │   │   │   ├── server.ts        ← Client server (bypass RLS)
│   │   │   │   └── ensure-profile.ts ← Auto-buat profil saat register
│   │   │   │
│   │   │   ├── contexts/            ← 🧠 State Global
│   │   │   │   ├── auth.context.tsx  ← Login/logout/session user
│   │   │   │   └── favorites.context.tsx ← Daftar favorit user
│   │   │   │
│   │   │   ├── store/               ← 🛒 State Keranjang
│   │   │   │   └── cart.ts          ← Zustand store (addItem, etc)
│   │   │   │
│   │   │   └── api/
│   │   │       └── auth-guard.ts    ← Cek auth di API routes
│   │   │
│   │   └── __tests__/               ← 🧪 File test
│   │       ├── auth-guard.test.ts   ← Test auth guard
│   │       └── api-routes.integration.test.ts ← Integration test
│   │
│   ├── public/                       ← 📁 File statis (gambar, font)
│   ├── Dockerfile                    ← 🐳 Docker build untuk frontend
│   ├── package.json                  ← 📦 Dependencies & scripts
│   ├── next.config.ts                ← ⚙️ Konfigurasi Next.js
│   ├── tsconfig.json                 ← ⚙️ Konfigurasi TypeScript
│   ├── eslint.config.mjs             ← ⚙️ Konfigurasi linting
│   ├── postcss.config.mjs            ← ⚙️ Konfigurasi PostCSS
│   ├── vitest.config.ts              ← ⚙️ Konfigurasi unit test
│   ├── vitest.integration.config.ts  ← ⚙️ Konfigurasi integration test
│   ├── .env.local                    ← 🔑 Kredensial Supabase (RAHASIA)
│   ├── .gitignore                    ← File yang diabaikan git
│   └── .dockerignore                 ← File yang diabaikan Docker build
│
├── 1-supabase-version/               ← 🟢 Deploy pakai Supabase Cloud
│   ├── docker-compose.yml            ← Docker config (1 container)
│   ├── .env.example                  ← Template env Supabase
│   ├── run-dev.bat                   ← Double-click untuk run
│   ├── README.md                     ← Panduan version ini
│   └── supabase/                     ← SQL untuk setup database Supabase
│       ├── run-all-migrations.sql    ← Jalankan semua migrasi sekaligus
│       ├── fix-applications-policies.sql ← Fix policy RLS
│       └── migrations/
│           ├── 001_create_roles_profiles_shops_products.sql
│           ├── 002_enable_rls_and_policies.sql
│           ├── 003_owner_onboarding_applications.sql
│           ├── 004_fix_shops_is_active.sql
│           ├── 005_fix_email_confirmation.sql
│           ├── 006_update_images.sql
│           ├── 007_click_tracking_and_fixes.sql
│           ├── 008_seed_data.sql
│           └── rollback_001_002.sql
│
├── 2-selfhosted-version/             ← 🔵 Deploy tanpa Supabase
│   ├── docker-compose.yml            ← Docker config (4 container)
│   ├── .env.example                  ← Template env self-hosted
│   ├── run-docker.bat                ← Double-click untuk run
│   ├── README.md                     ← Panduan version ini
│   │
│   ├── backend/                      ← 🖥️ Express.js API Server
│   │   ├── server.js                 ← Entry point backend
│   │   ├── package.json              ← Dependencies backend
│   │   ├── Dockerfile                ← Docker build backend
│   │   ├── config/
│   │   │   ├── supabase.js           ← Config koneksi Supabase
│   │   │   └── redis.js              ← Config Redis (caching)
│   │   ├── routes/                   ← Definisi API endpoint
│   │   │   ├── index.js              ← Router utama
│   │   │   ├── auth.routes.js        ← /api/auth/*
│   │   │   ├── product.routes.js     ← /api/products/*
│   │   │   ├── shop.routes.js        ← /api/shops/*
│   │   │   ├── favorites.routes.js   ← /api/favorites/*
│   │   │   ├── owner.routes.js       ← /api/owner/*
│   │   │   └── admin.routes.js       ← /api/admin/*
│   │   ├── controllers/              ← Logika bisnis
│   │   │   ├── auth.controller.js    ← Register, login, profil
│   │   │   ├── product.controller.js ← CRUD produk
│   │   │   ├── shop.controller.js    ← CRUD toko
│   │   │   ├── favorites.controller.js ← Toggle favorit
│   │   │   ├── owner.controller.js   ← Kelola toko/produk sendiri
│   │   │   └── admin.controller.js   ← Kelola semua (admin)
│   │   ├── middlewares/              ← Middleware (pengecekan)
│   │   │   ├── auth.middleware.js    ← Cek JWT token
│   │   │   ├── role.middleware.js    ← Cek role user
│   │   │   ├── error.middleware.js   ← Handle error global
│   │   │   ├── upload.middleware.js  ← Handle upload file
│   │   │   └── validate.middleware.js ← Validasi input (Zod)
│   │   ├── utils/
│   │   │   ├── constants.js          ← Konstanta (roles, etc)
│   │   │   ├── response.js           ← Format response standar
│   │   │   └── schemas.js            ← Skema validasi Zod
│   │   └── database/
│   │       ├── migration.sql         ← SQL migrasi
│   │       ├── seed.js               ← Data dummy
│   │       └── favorites-migration.js ← Migrasi tabel favorit
│   │
│   ├── database/                     ← 🗄️ Schema PostgreSQL
│   │   └── init.sql                  ← Buat tabel saat pertama kali
│   │
│   └── nginx/                        ← 🌐 Reverse Proxy
│       └── nginx.conf                ← Konfigurasi Nginx
│
├── scripts/                          ← 🛠️ Script utility
│   ├── auto-debug.mjs                ← Auto debug helper
│   └── dummy-photos.mjs              ← Generate foto dummy
│
├── .github/                          ← ⚙️ GitHub config
│   ├── workflows/ci.yml              ← CI/CD pipeline
│   └── prompts/                      ← AI prompts
│
├── README.md                         ← 📖 Dokumentasi utama
├── PANDUAN_DEPLOY_VPS.md             ← 🚀 Panduan deploy VPS
├── .gitignore                        ← File yang diabaikan git
└── skills-lock.json                  ← Config internal
```

---

## 📂 1. FOLDER ROOT

### File-file di Root

| File | Kegunaan |
| ---- | -------- |
| `README.md` | Dokumentasi utama proyek. Berisi arsitektur, tech stack, cara install, cara deploy, API endpoints, test accounts. |
| `PANDUAN_DEPLOY_VPS.md` | Panduan step-by-step deploy ke VPS. |
| `.gitignore` | Daftar file/folder yang tidak diupload ke Git (node_modules, .env, .next, dll). |
| `skills-lock.json` | File konfigurasi internal AI, bisa diabaikan. |

### Folder-folder Utama

| Folder | Kegunaan |
| ------ | -------- |
| `web/` | **Kode frontend utama.** Ini yang kamu edit sehari-hari. Dipakai oleh kedua versi. |
| `1-supabase-version/` | Konfigurasi deployment untuk mode Supabase Cloud. |
| `2-selfhosted-version/` | Konfigurasi deployment + backend untuk mode self-hosted. |
| `scripts/` | Script bantuan (generate foto dummy, debug). |
| `.github/` | CI/CD workflow untuk GitHub Actions. |

---

## 🎨 2. FOLDER `web/` — FRONTEND (NEXT.JS)

Ini adalah jantung dari proyek. **Semua yang kamu lihat di browser ada di sini.**

### 2.1 Konfigurasi (`web/` root)

| File | Kegunaan | Penjelasan |
| ---- | -------- | ---------- |
| `package.json` | Daftar dependencies dan scripts | Berisi: Next.js 16, React 19, Supabase client, Zustand (cart), Zod (validasi), Tailwind CSS 4, Vitest (testing). Scripts: `dev`, `build`, `start`, `test`. |
| `next.config.ts` | Konfigurasi Next.js | Output: `standalone` (untuk Docker). Allow remote images dari Supabase storage dan Unsplash. |
| `tsconfig.json` | Konfigurasi TypeScript | Strict mode, path alias `@/` → `src/`. |
| `Dockerfile` | Docker build | 3 tahap: install deps → build → runner. Image Node 20 Alpine, port 3000. |
| `.env.local` | Environment variables | **RAHASIA!** Berisi URL dan keys Supabase. Tidak diupload ke Git. |
| `eslint.config.mjs` | Linting rules | Aturan penulisan kode agar konsisten. |
| `postcss.config.mjs` | PostCSS setup | Diperlukan oleh Tailwind CSS. |
| `vitest.config.ts` | Unit test config | Konfigurasi Vitest untuk test. |

### 2.2 Halaman (`web/src/app/`)

Next.js menggunakan **file-based routing** — setiap folder di `app/` = 1 URL.

#### Halaman Publik (Bisa diakses siapa saja)

| File | URL | Apa yang ditampilkan |
| ---- | --- | -------------------- |
| `page.tsx` | `/` | **Homepage.** Hero banner, 8 produk terbaru, 6 toko terbaru, CTA. Data diambil dari Supabase saat server render. |
| `products/page.tsx` | `/products` | **Daftar produk.** Tampilkan semua produk dengan filter & search. |
| `products/[id]/page.tsx` | `/products/123` | **Detail produk.** Foto besar, deskripsi, harga, tombol "Add to Cart", info toko. `[id]` = parameter dinamis. |
| `shops/page.tsx` | `/shops` | **Daftar toko.** Kartu-kartu toko dengan gambar, nama, lokasi. |
| `shops/[id]/page.tsx` | `/shops/abc` | **Detail toko.** Info toko + daftar produknya. |
| `help/cara-belanja/page.tsx` | `/help/cara-belanja` | Panduan cara belanja. |
| `help/ketentuan/page.tsx` | `/help/ketentuan` | Syarat & ketentuan. |
| `help/privasi/page.tsx` | `/help/privasi` | Kebijakan privasi. |

#### Halaman Auth

| File | URL | Apa yang ditampilkan |
| ---- | --- | -------------------- |
| `auth/login/page.tsx` | `/auth/login` | Form login (email + password). Setelah login, redirect ke homepage. |
| `auth/register/page.tsx` | `/auth/register` | Form registrasi (nama + email + password). Auto-buat profil di database. |

#### Halaman User (Butuh Login)

| File | URL | Apa yang ditampilkan |
| ---- | --- | -------------------- |
| `cart/page.tsx` | `/cart` | Isi keranjang belanja. Bisa ubah jumlah, hapus, lihat total. Link ke WhatsApp toko. |
| `favorites/page.tsx` | `/favorites` | Daftar produk yang di-favorit ❤️. |
| `profile/page.tsx` | `/profile` | Halaman profil user: nama, email, role, tanggal bergabung. |
| `apply-owner/page.tsx` | `/apply-owner` | Form untuk mendaftar jadi pemilik toko. Isi: nama toko, lokasi, WhatsApp, alasan. |

#### Dashboard (Butuh Role Owner/Admin)

| File | URL | Siapa | Apa yang ditampilkan |
| ---- | --- | ----- | -------------------- |
| `dashboard/layout.tsx` | — | — | Template dashboard dengan sidebar navigasi. |
| `dashboard/page.tsx` | `/dashboard` | Owner/Admin | Ringkasan: total produk, pesanan, penghasilan. |
| `dashboard/analytics/page.tsx` | `/dashboard/analytics` | Owner/Admin | Grafik: view produk, klik WhatsApp, statistik. |
| `dashboard/products/page.tsx` | `/dashboard/products` | Owner/Admin | Daftar produk dengan tombol edit & hapus. |
| `dashboard/products/new/page.tsx` | `/dashboard/products/new` | Owner | Form tambah produk baru. |
| `dashboard/products/admin-new/page.tsx` | `/dashboard/products/admin-new` | Admin | Form tambah produk (untuk toko manapun). |
| `dashboard/products/[id]/edit/page.tsx` | `/dashboard/products/5/edit` | Owner/Admin | Form edit produk yang sudah ada. |
| `dashboard/shop/page.tsx` | `/dashboard/shop` | Owner | Kelola info toko sendiri. |
| `dashboard/shops/page.tsx` | `/dashboard/shops` | Admin | Kelola SEMUA toko (aktif/nonaktif). |
| `dashboard/applications/page.tsx` | `/dashboard/applications` | Admin | Review pendaftaran owner baru. |

### 2.3 API Routes (`web/src/app/api/`)

Ini adalah **backend ringan** yang berjalan di dalam Next.js. Setiap file `route.ts` menangani HTTP request.

```
Browser → fetch("/api/cart") → api/cart/route.ts → Supabase → response JSON
```

| Endpoint | Method | Auth | Kegunaan |
| -------- | ------ | ---- | -------- |
| `/api/cart` | GET, POST, DELETE | ✅ | Kelola keranjang belanja |
| `/api/favorites` | GET, POST | ✅ | Kelola daftar favorit |
| `/api/applications` | GET, POST | ✅ | Buat/lihat pendaftaran owner |
| `/api/applications/my-status` | GET | ✅ | Cek status pendaftaran saya |
| `/api/applications/[id]/review` | POST | Admin | Setujui/tolak pendaftaran |
| `/api/owner/shop` | GET, PUT | Owner | Kelola toko sendiri |
| `/api/owner/products` | GET, POST | Owner | Kelola produk sendiri |
| `/api/owner/products/[id]` | PUT, DELETE | Owner | Edit/hapus produk |
| `/api/owner/dashboard-stats` | GET | Owner | Statistik dashboard |
| `/api/admin/analytics` | GET | Admin | Data analytics |
| `/api/admin/products` | GET | Admin | Semua produk |
| `/api/admin/shops` | GET | Admin | Semua toko |
| `/api/admin/shops/[id]/toggle` | POST | Admin | Aktif/nonaktifkan toko |
| `/api/tracking/product-view` | POST | — | Catat view produk |
| `/api/tracking/shop-view` | POST | — | Catat view toko |
| `/api/tracking/whatsapp-click` | POST | — | Catat klik WhatsApp |
| `/api/profile/ensure` | POST | ✅ | Pastikan profil ada di DB |
| `/api/test-db` | GET | — | Test koneksi database |

**Logika Tiap API Route:**
```
1. Terima request dari browser
2. Cek auth (getAuthUser) → apakah user sudah login?
3. Cek role (requireRole) → apakah user punya izin?
4. Query ke Supabase (select/insert/update/delete)
5. Return JSON response
```

### 2.4 Komponen UI (`web/src/components/`)

Komponen = bagian UI yang bisa dipakai ulang di banyak halaman.

#### Layout

| File | Kegunaan | Dimana Dipakai |
| ---- | -------- | -------------- |
| `navbar.tsx` | Menu navigasi atas. Logo, link (Beranda/Produk/Toko), ikon keranjang+favorit, menu user. Responsive (hamburger di mobile). | Setiap halaman (via layout.tsx) |
| `footer.tsx` | Footer bawah. Link bantuan, info developer, copyright. | Setiap halaman (via layout.tsx) |

#### Home

| File | Kegunaan |
| ---- | -------- |
| `hero-section.tsx` | Banner utama homepage. Judul besar "Temukan Rangkaian Bunga Sempurna", tombol CTA, gambar background. Animasi dengan Framer Motion. |
| `featured-products.tsx` | Grid 8 produk terbaru di homepage. Menerima data products sebagai prop. |
| `featured-shops.tsx` | Grid 6 toko terbaru di homepage. Menerima data shops sebagai prop. |

#### Product

| File | Kegunaan |
| ---- | -------- |
| `product-card.tsx` | Kartu produk: gambar, nama, harga (Rp XX.XXX), tombol "Add to Cart" 🛒, tombol "Favorite" ❤️. Menggunakan cart store dan favorites context. |
| `product-detail.tsx` | Tampilan detail produk: gambar besar, deskripsi lengkap, harga, stok, info toko, tombol beli via WhatsApp. |
| `product-grid.tsx` | Layout grid responsive untuk menampilkan banyak ProductCard. 1 kolom (mobile) → 2 kolom → 3 kolom → 4 kolom (desktop). |

#### Shop

| File | Kegunaan |
| ---- | -------- |
| `shop-card.tsx` | Kartu toko: gambar, nama toko, lokasi, jumlah produk. |
| `shop-grid.tsx` | Layout grid responsive untuk ShopCard. |
| `shop-view-tracker.tsx` | Komponen invisible yang otomatis mengirim POST `/api/tracking/shop-view` saat user buka halaman toko. Untuk analytics. |

#### Auth

| File | Kegunaan |
| ---- | -------- |
| `auth-forms.tsx` | Form login dan register yang bisa di-switch. Validasi input, show/hide password, error messages. |
| `protected-route.tsx` | Wrapper yang redirect ke `/auth/login` kalau user belum login. Dipakai di halaman yang butuh auth. |

#### Cart

| File | Kegunaan |
| ---- | -------- |
| `add-to-cart-button.tsx` | Tombol "Tambah ke Keranjang" yang standalone. Cek auth, panggil cart store. |
| `cart-view.tsx` | Tampilan full keranjang: daftar item, ubah quantity, hapus, total harga, tombol checkout via WhatsApp. |

#### Dashboard

| File | Kegunaan |
| ---- | -------- |
| `dashboard-stats.tsx` | Kartu statistik: total produk, total view, total klik WhatsApp. Data dari API. |
| `product-form.tsx` | Form untuk tambah/edit produk: nama, deskripsi, harga, kategori, stok, gambar. Validasi dengan Zod. |
| `shop-form.tsx` | Form untuk kelola toko: nama, deskripsi, lokasi, WhatsApp, Instagram, gambar. |
| `delete-product-button.tsx` | Tombol hapus produk dengan konfirmasi "Yakin hapus?". |

#### UI (Primitif)

| File | Kegunaan |
| ---- | -------- |
| `button.tsx` | Tombol styled dengan variant (primary, secondary, danger, ghost) dan size (sm, md, lg). |
| `input.tsx` | Input field styled dengan label, error message, icon. |
| `skeleton.tsx` | Loading placeholder (animasi shimmer) saat data belum di-load. |

### 2.5 Library (`web/src/lib/`)

Ini adalah "otak" dari aplikasi — logika yang dipakai di banyak tempat.

#### Types (Tipe Data)

| File | Isinya |
| ---- | ------ |
| `types.ts` | Definisi tipe: `Shop` (id, name, location, whatsapp, ...), `Product` (id, name, price, stock, ...), `CartItem` (product + quantity), `ProductWithShop`. |
| `types/auth.ts` | Definisi tipe auth: `User` (id, email, role), `LoginData`, `RegisterData`. Juga `PERMISSIONS` = mapping role → kemampuan (can_manage_own_shop, can_manage_all, dll). |

#### Utils

| File | Isinya |
| ---- | ------ |
| `utils.ts` | `cn()` = gabungan clsx + tailwind-merge untuk class names. `formatPrice(50000)` → "Rp 50.000". `formatDate()` → format tanggal Indonesia. |

#### Supabase (Koneksi Database)

| File | Kegunaan | Kapan Dipakai |
| ---- | -------- | ------------- |
| `client.ts` | Buat koneksi Supabase dari **browser**. Menggunakan anon key (terbatas oleh RLS). | Di komponen client-side (auth, favorites, dll). |
| `server.ts` | Buat koneksi Supabase dari **server**. 2 fungsi: `createServerClient()` (anon + cookies, untuk SSR) dan `createServiceClient()` (service_role, bypass RLS, untuk API routes). | Di page.tsx (SSR) dan api/route.ts. |
| `ensure-profile.ts` | Otomatis buat row di tabel `profiles` saat user pertama kali register. | Dipanggil setelah Supabase Auth register. |

**Perbedaan Client vs Server:**
```
┌─────────────────────────────────────────────────────────────┐
│  Browser (client.ts)              Server (server.ts)         │
│                                                              │
│  Anon key                        Service role key            │
│  RLS berlaku                     Bypass RLS                  │
│  Terbatas                        Full akses                  │
│  User hanya lihat data sendiri   Bisa akses semua data       │
└─────────────────────────────────────────────────────────────┘
```

#### Contexts (State Global)

| File | Kegunaan | Logika |
| ---- | -------- | ------ |
| `auth.context.tsx` | Kelola state login user. Fungsi: `login()`, `register()`, `logout()`, `updateProfile()`. Cek session via `onAuthStateChange`. Menyimpan user data (id, email, role). Menyediakan `hasPermission()` dan `isRole()`. | Saat app dimuat → cek ada session? → fetch profil dari DB → simpan ke state → semua komponen bisa tahu siapa yang login. |
| `favorites.context.tsx` | Kelola daftar favorit user. Fungsi: `addToFavorites()`, `removeFromFavorites()`, `toggleFavorite()`, `isFavorited()`. Data disimpan di database (permanen). | Saat user login → fetch favorites dari API → simpan ke state. Saat toggle → POST/DELETE ke API → update state lokal. |

#### Store (State Lokal)

| File | Kegunaan | Logika |
| ---- | -------- | ------ |
| `cart.ts` | Zustand store untuk keranjang. Fungsi: `addItem()`, `removeItem()`, `updateQuantity()`, `clearCart()`, `totalItems()`, `totalPrice()`. Data disimpan di **memori browser** (hilang saat refresh). | `addItemWithAuth()` → cek login → kalau belum, redirect ke auth/login → kalau sudah, cek apakah produk sudah di cart → kalau sudah, tambah quantity → kalau belum, tambah item baru. |

#### API Helper

| File | Kegunaan |
| ---- | -------- |
| `api/auth-guard.ts` | `getAuthUser(request)` = ambil token dari header, verifikasi ke Supabase, return user data. `requireRole(request, ['admin'])` = cek apakah user punya role tertentu, throw 403 kalau tidak. |

---

## 🟢 3. FOLDER `1-supabase-version/`

Folder ini berisi **konfigurasi untuk deploy dengan Supabase Cloud**. Tidak ada kode backend di sini — semua logic ada di `web/src/app/api/`.

| File | Kegunaan |
| ---- | -------- |
| `docker-compose.yml` | Docker config. Hanya 1 service: `web` (Next.js). Build dari `../web`. Menerima env vars Supabase. Port 3000. |
| `.env.example` | Template environment. 3 variabel: URL Supabase, anon key, service role key. |
| `run-dev.bat` | Script Windows. Double-click → langsung jalankan `npm run dev` di folder `../web`. |
| `README.md` | Panduan singkat untuk version ini. |

### SQL Migrations (`supabase/migrations/`)

File SQL ini dijalankan di **Supabase SQL Editor** untuk membuat tabel-tabel database.

| File | Apa yang Dibuat |
| ---- | --------------- |
| `001_create_roles_profiles_shops_products.sql` | Tabel: `profiles` (id, full_name, role, avatar_url), `shops` (id, owner_id, name, location, whatsapp), `products` (id, shop_id, name, price, stock, image_url). |
| `002_enable_rls_and_policies.sql` | RLS (Row Level Security) policies: user hanya bisa akses data sendiri, semua orang bisa lihat produk/toko, owner hanya bisa edit produknya. |
| `003_owner_onboarding_applications.sql` | Tabel: `applications` (id, user_id, shop_name, status, reviewed_by). |
| `004_fix_shops_is_active.sql` | Tambah kolom `is_active` di tabel shops. |
| `005_fix_email_confirmation.sql` | Fix agar email tidak perlu konfirmasi (untuk development). |
| `006_update_images.sql` | Update URL gambar default. |
| `007_click_tracking_and_fixes.sql` | Tabel tracking: `product_views`, `shop_views`, `whatsapp_clicks`. |
| `008_seed_data.sql` | Data dummy: 5 toko, 30 produk, 3 user (admin, owner, buyer). |
| `rollback_001_002.sql` | Script untuk undo migration 1 dan 2 (kalau perlu). |
| `run-all-migrations.sql` | Jalankan SEMUA migration sekaligus (paling mudah). |

---

## 🔵 4. FOLDER `2-selfhosted-version/`

Folder ini berisi **backend + database + proxy** untuk deploy tanpa Supabase.

### 4.1 Docker & Config

| File | Kegunaan |
| ---- | -------- |
| `docker-compose.yml` | 4 service: **postgres** (database), **backend** (Express.js API), **frontend** (Next.js), **nginx** (reverse proxy). |
| `.env.example` | Template env: DB credentials, JWT secret, port. |
| `run-docker.bat` | Script Windows. Double-click → `docker compose up --build`. |

### 4.2 Backend Express.js (`backend/`)

Backend ini **hanya dipakai di self-hosted version**. Di Supabase version, Next.js API routes yang menggantikannya.

#### Entry Point

| File | Kegunaan |
| ---- | -------- |
| `server.js` | Titik masuk Express. Setup: CORS, JSON parser, Morgan (logging). Mount semua routes di `/api`. Error handler global. Listen port 5000. |
| `package.json` | Dependencies: Express, Supabase JS, bcrypt (hash password), jsonwebtoken (JWT), Multer (upload), Zod (validasi), Morgan (log). |
| `Dockerfile` | Docker build: Node 20 Alpine, npm ci --production, user non-root `expressjs`, port 5000. |

#### Routes (Definisi Endpoint)

Setiap file mendefinisikan URL → middleware → controller.

| File | Endpoint | Middleware |
| ---- | -------- | ---------- |
| `auth.routes.js` | POST `/auth/register`, POST `/auth/login`, GET `/auth/profile` | — / auth |
| `product.routes.js` | GET `/products`, GET `/products/:id` | — |
| `shop.routes.js` | GET `/shops`, GET `/shops/:id` | — |
| `favorites.routes.js` | GET/POST/DELETE `/favorites` | auth |
| `owner.routes.js` | GET/POST/PUT/DELETE `/owner/products`, GET/PUT `/owner/shop` | auth + role(owner) |
| `admin.routes.js` | GET `/admin/stats`, POST `/admin/shops/:id/toggle`, GET/POST `/admin/applications` | auth + role(admin) |

#### Controllers (Logika Bisnis)

| File | Logika |
| ---- | ------ |
| `auth.controller.js` | **Register:** validasi input → hash password (bcrypt) → insert ke tabel users → return JWT token. **Login:** cari user by email → compare password → generate JWT → return token + user data. |
| `product.controller.js` | **List:** `SELECT * FROM products JOIN shops` dengan pagination & filter. **Detail:** `SELECT * WHERE id = ?`. |
| `shop.controller.js` | **List:** `SELECT * FROM shops WHERE is_active = true`. **Detail:** shop + produk-produknya. |
| `favorites.controller.js` | **Toggle:** cek favorit ada? → kalau ada, DELETE → kalau tidak, INSERT. |
| `owner.controller.js` | **Create product:** validasi → cek ownership toko → INSERT product. **Update/Delete:** cek apakah produk milik owner ini. |
| `admin.controller.js` | **Toggle shop:** UPDATE `is_active` = !current. **Review application:** UPDATE status = approved/rejected → kalau approved, UPDATE user role = 'owner' + buat shop. |

#### Middlewares (Pengecekan)

| File | Logika |
| ---- | ------ |
| `auth.middleware.js` | Ambil header `Authorization: Bearer xxx` → verify JWT → attach `req.user = { id, role }` → next(). Kalau gagal: 401. |
| `role.middleware.js` | Cek `req.user.role` ada di list yang diizinkan? Kalau tidak: 403 Forbidden. |
| `validate.middleware.js` | Parse `req.body` dengan Zod schema. Kalau invalid: 400 + detail error. |
| `error.middleware.js` | Tangkap semua error yang tidak ter-handle. Log error, return 500 + message. |
| `upload.middleware.js` | Konfigurasi Multer untuk upload gambar. Max size, tipe file, storage. |

### 4.3 Database (`database/init.sql`)

SQL yang dijalankan otomatis saat PostgreSQL container pertama kali start.

**Tabel yang dibuat:**

```sql
-- 1. Users (pengguna)
users: id, email, password (hash), full_name, role, avatar_url, is_verified

-- 2. Shops (toko)
shops: id, owner_id → users, name, description, location, whatsapp, image_url, is_active

-- 3. Products (produk)
products: id, shop_id → shops, name, description, price, image_url, category, stock

-- 4. Cart Items (keranjang)
cart_items: id, user_id → users, product_id → products, quantity
-- UNIQUE(user_id, product_id) → 1 produk per entry

-- 5. Favorites (favorit)
favorites: id, user_id → users, product_id → products
-- UNIQUE(user_id, product_id)

-- 6. Applications (pendaftaran owner)
applications: id, user_id → users, shop_name, shop_location, whatsapp, reason, status, reviewed_by, reject_reason
```

**Seed data:** Admin user (`admin@flowermarket.com` / `admin123456`)

### 4.4 Nginx (`nginx/nginx.conf`)

Nginx bertindak sebagai **gerbang utama** — semua request masuk lewat sini.

```
User → http://domain.com (port 80)
                │
                ▼
            Nginx
            ┌───────────────────────────────┐
            │                               │
            │  location /     → frontend    │ (Next.js port 3000)
            │  location /api  → backend     │ (Express port 5000)
            │  location /health → 200 OK    │
            │                               │
            └───────────────────────────────┘
```

---

## 🔄 5. ALUR DATA & FLOW APLIKASI

### Flow 1: User Buka Homepage

```
1. User ketik URL di browser
2. Request masuk ke Next.js server
3. page.tsx (server component) dieksekusi
4. createServerClient() → koneksi ke Supabase
5. Query: SELECT * FROM products LIMIT 8
6. Query: SELECT * FROM shops LIMIT 6
7. Data dikirim ke browser sebagai HTML
8. Browser render: HeroSection + FeaturedProducts + FeaturedShops
9. React hydration: komponen jadi interaktif
```

### Flow 2: User Register & Login

```
REGISTER:
1. User isi form di /auth/register
2. auth.context → supabase.auth.signUp(email, password)
3. Supabase Auth buat user di auth.users
4. onAuthStateChange trigger → fetchProfile()
5. ensure-profile.ts → INSERT INTO profiles
6. User tersimpan di state, redirect ke homepage

LOGIN:
1. User isi form di /auth/login
2. auth.context → supabase.auth.signInWithPassword()
3. Supabase return session + JWT token
4. onAuthStateChange trigger → fetchProfile()
5. Query: SELECT * FROM profiles WHERE id = user.id
6. User data (id, email, role) tersimpan di state
7. Navbar berubah: tampilkan nama user + menu dashboard
```

### Flow 3: User Tambah ke Keranjang

```
1. User klik 🛒 di ProductCard
2. ProductCard → cart.ts: addItemWithAuth(product)
3. Cek: user sudah login? (dari auth.context)
4. Kalau belum → redirect ke /auth/login
5. Kalau sudah → cek produk sudah di cart?
   - Sudah ada: quantity + 1
   - Belum ada: tambah {product, quantity: 1}
6. Zustand state update → Navbar badge terupdate
7. Data HANYA di memori browser (hilang saat refresh)
```

### Flow 4: User Favorit Produk

```
1. User klik ❤️ di ProductCard
2. favorites.context → toggleFavorite(productId)
3. Cek: sudah difavorit?
   - Sudah → DELETE /api/favorites (hapus)
   - Belum → POST /api/favorites (tambah)
4. API route → getAuthUser() cek token
5. API route → query Supabase: INSERT/DELETE dari tabel favorites
6. Response sukses → update state lokal
7. Ikon ❤️ berubah warna (merah/abu-abu)
8. Data PERMANEN di database (tidak hilang)
```

### Flow 5: Owner Tambah Produk

```
1. Owner login → dashboard muncul di navbar
2. Owner buka /dashboard/products/new
3. Isi form: nama, harga, kategori, stok, gambar
4. Klik "Simpan"
5. Frontend → POST /api/owner/products
6. auth-guard.ts → cek token → cek role = 'owner'
7. Validasi input dengan Zod
8. INSERT INTO products (shop_id = owner's shop)
9. Redirect ke /dashboard/products
10. Produk baru tampil di website
```

### Flow 6: Admin Review Pendaftaran Owner

```
1. User biasa submit form di /apply-owner
2. POST /api/applications → INSERT INTO applications (status: 'pending')
3. Admin login → buka /dashboard/applications
4. GET /api/applications → SELECT * WHERE status = 'pending'
5. Admin klik "Setujui"
6. POST /api/applications/[id]/review → { status: 'approved' }
7. API route:
   - UPDATE applications SET status = 'approved'
   - UPDATE profiles SET role = 'owner'
   - INSERT INTO shops (nama toko dari aplikasi)
8. User yang disetujui sekarang bisa akses dashboard owner
```

---

## 🖥️ 6. CARA MENJALANKAN DI LOKAL

### Cara 1: Paling Simpel (Supabase Cloud)

```powershell
cd "c:\Users\HYPE AMD\Documents\Leaarning\Dev\Web\Flower_Marketplace\web"
npm install    # sekali saja
npm run dev    # jalankan setiap mau coding
```

Buka http://localhost:3000 — selesai!

### Cara 2: Dengan Docker (Tanpa Install PostgreSQL)

```powershell
# Terminal 1: Jalankan database + backend di Docker
cd "c:\Users\HYPE AMD\Documents\Leaarning\Dev\Web\Flower_Marketplace\2-selfhosted-version"
copy .env.example .env
docker compose up -d postgres backend

# Terminal 2: Jalankan frontend (hot-reload)
cd "c:\Users\HYPE AMD\Documents\Leaarning\Dev\Web\Flower_Marketplace\web"
npm run dev
```

### Cara 3: Full Docker (Simulasi Production)

```powershell
cd "c:\Users\HYPE AMD\Documents\Leaarning\Dev\Web\Flower_Marketplace\2-selfhosted-version"
copy .env.example .env
docker compose up --build
# Buka http://localhost
```

### Cara 4: Test Sebelum Deploy

```powershell
# Jalankan tests
cd web
npm test                    # Unit tests
npm run test:integration    # Integration tests

# Build production (cek apakah build sukses)
npm run build
```

---

## 📊 7. TABEL RINGKASAN SEMUA FILE

### Frontend (`web/`)

| # | File | Tipe | Kegunaan Singkat |
| - | ---- | ---- | ---------------- |
| 1 | `layout.tsx` | Layout | Bungkus semua halaman (navbar + footer + providers) |
| 2 | `page.tsx` | Page | Homepage (hero + produk + toko terbaru) |
| 3 | `globals.css` | Style | CSS global, tema warna rose/pink |
| 4 | `navbar.tsx` | Component | Menu navigasi responsive |
| 5 | `footer.tsx` | Component | Footer informasi |
| 6 | `hero-section.tsx` | Component | Banner utama homepage |
| 7 | `product-card.tsx` | Component | Kartu produk (gambar+harga+tombol) |
| 8 | `product-detail.tsx` | Component | Detail produk lengkap |
| 9 | `shop-card.tsx` | Component | Kartu toko |
| 10 | `auth-forms.tsx` | Component | Form login/register |
| 11 | `protected-route.tsx` | Component | Guard halaman yang butuh auth |
| 12 | `cart-view.tsx` | Component | Tampilan keranjang |
| 13 | `favorite-button.tsx` | Component | Tombol ❤️ |
| 14 | `product-form.tsx` | Component | Form tambah/edit produk |
| 15 | `auth.context.tsx` | Context | State login/logout global |
| 16 | `favorites.context.tsx` | Context | State favorit global |
| 17 | `cart.ts` | Store | State keranjang (Zustand) |
| 18 | `client.ts` | Supabase | Koneksi DB dari browser |
| 19 | `server.ts` | Supabase | Koneksi DB dari server |
| 20 | `auth-guard.ts` | Helper | Cek auth di API routes |
| 21 | `types.ts` | Types | Definisi tipe data |
| 22 | `utils.ts` | Utils | Helper functions |

### Backend (`2-selfhosted-version/backend/`)

| # | File | Tipe | Kegunaan Singkat |
| - | ---- | ---- | ---------------- |
| 1 | `server.js` | Entry | Setup Express, mount routes, error handler |
| 2 | `routes/index.js` | Router | Gabungkan semua route files |
| 3 | `auth.routes.js` | Route | Endpoint register/login/profil |
| 4 | `product.routes.js` | Route | Endpoint daftar/detail produk |
| 5 | `shop.routes.js` | Route | Endpoint daftar/detail toko |
| 6 | `favorites.routes.js` | Route | Endpoint favorit |
| 7 | `owner.routes.js` | Route | Endpoint owner (kelola toko) |
| 8 | `admin.routes.js` | Route | Endpoint admin (kelola semua) |
| 9 | `auth.controller.js` | Controller | Logika register, login, profil |
| 10 | `product.controller.js` | Controller | Logika CRUD produk |
| 11 | `shop.controller.js` | Controller | Logika CRUD toko |
| 12 | `favorites.controller.js` | Controller | Logika toggle favorit |
| 13 | `owner.controller.js` | Controller | Logika owner |
| 14 | `admin.controller.js` | Controller | Logika admin |
| 15 | `auth.middleware.js` | Middleware | Verifikasi JWT token |
| 16 | `role.middleware.js` | Middleware | Cek role permission |
| 17 | `validate.middleware.js` | Middleware | Validasi input (Zod) |
| 18 | `error.middleware.js` | Middleware | Handle error global |

### Konfigurasi & Deploy

| # | File | Kegunaan |
| - | ---- | -------- |
| 1 | `1-supabase-version/docker-compose.yml` | Deploy 1 container (Next.js + Supabase) |
| 2 | `2-selfhosted-version/docker-compose.yml` | Deploy 4 containers (Nginx+Next+Express+PostgreSQL) |
| 3 | `database/init.sql` | Schema SQL untuk self-hosted |
| 4 | `nginx/nginx.conf` | Reverse proxy config |
| 5 | `web/Dockerfile` | Docker build frontend |
| 6 | `backend/Dockerfile` | Docker build backend |
| 7 | `supabase/migrations/*.sql` | Setup database Supabase |

---

**Kalau ada yang belum jelas, jangan ragu tanya! Selamat belajar!** 🌸

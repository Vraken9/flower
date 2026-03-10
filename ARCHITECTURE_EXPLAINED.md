# 🌸 Memahami Flower Marketplace: Panduan untuk Developer Pemula

Halo! Dokumen ini akan menjelaskan bagaimana website Flower Marketplace bekerja dengan cara yang mudah dipahami. Kita akan menggunakan analogi dan bahasa sehari-hari.

---

## 🏪 ANALOGI BESAR: Website Ini Adalah Sebuah Mall Bunga

Bayangkan website ini seperti **Mall Bunga** yang besar dan modern:

```
┌─────────────────────────────────────────────────────────────────────┐
│                       🏬 MALL BUNGA "BLOOM"                          │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                  🚪 PINTU MASUK (layout.tsx)                  │  │
│  │         Setiap pengunjung HARUS lewat sini dulu              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                       │
│  ┌────────────────┐  ┌───────▼───────┐  ┌────────────────┐         │
│  │   👮 SATPAM    │  │  🎪 LOBBY     │  │  📋 CUSTOMER   │         │
│  │  (auth.context)│  │  (page.tsx)   │  │    SERVICE     │         │
│  │                │  │               │  │  (api routes)  │         │
│  │ Cek ID & Izin  │  │ Tampilan Awal │  │ Proses Request │         │
│  └────────────────┘  └───────────────┘  └────────────────┘         │
│                                                                      │
│  ┌────────────────┐  ┌───────────────┐  ┌────────────────┐         │
│  │   🛒 TROLI     │  │  💝 WISHLIST  │  │  🗄️ GUDANG    │         │
│  │  (cart store)  │  │  (favorites)  │  │  (Supabase)   │         │
│  │                │  │               │  │               │         │
│  │ Simpan Belanja │  │ Simpan Suka   │  │ Simpan Data   │         │
│  └────────────────┘  └───────────────┘  └────────────────┘         │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    🏪 TOKO-TOKO (shops)                       │  │
│  │     ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐         │  │
│  │     │Toko │ │Toko │ │Toko │ │Toko │ │Toko │ │Toko │         │  │
│  │     │  A  │ │  B  │ │  C  │ │  D  │ │  E  │ │  F  │         │  │
│  │     └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌────────────────┐  ┌───────────────┐  ┌────────────────┐         │
│  │  👤 PEMBELI    │  │  🏪 PEMILIK   │  │  👑 MANAJER    │         │
│  │   (user)       │  │    TOKO       │  │    MALL        │         │
│  │                │  │   (owner)     │  │   (admin)      │         │
│  │ Bisa beli,     │  │ Bisa kelola   │  │ Bisa kelola    │         │
│  │ favorit, cart  │  │ toko sendiri  │  │ semua toko     │         │
│  └────────────────┘  └───────────────┘  └────────────────┘         │
└─────────────────────────────────────────────────────────────────────┘
```

### Penjelasan Analogi:

| Komponen Website | Di Mall Bunga | Fungsinya |
|-----------------|---------------|-----------|
| `layout.tsx` | **Pintu Masuk Mall** | Setiap halaman harus lewat sini. Tempat navbar & footer dipasang. |
| `page.tsx` (home) | **Lobby Mall** | Hal pertama yang dilihat pengunjung. Ada promo dan toko unggulan. |
| `auth.context` | **Satpam** | Memeriksa siapa yang masuk, apa haknya. |
| `cart store` | **Troli Belanja** | Tempat menyimpan barang sebelum checkout. |
| `favorites.context` | **Wishlist** | Daftar produk yang disukai tapi belum dibeli. |
| `api routes` | **Customer Service** | Tempat proses pesanan, cek stok, dll. |
| `Supabase` | **Gudang + Kantor** | Tempat semua data disimpan (produk, user, pesanan). |

---

## 📁 PENJELASAN FILE PER FILE

### 1. 🚪 `layout.tsx` — Pintu Masuk Mall

**Lokasi:** `web/src/app/layout.tsx`

**Tanggung Jawab:**
Seperti **pintu masuk mall**, file ini adalah hal PERTAMA yang dijalankan. Semua halaman website "dibungkus" oleh file ini. Di sinilah kita memasang:
- Navbar (menu navigasi atas)
- Footer (informasi bawah)
- Provider untuk Auth dan Favorites

**Logika Penting:**
```tsx
// Baris 42-44: Membungkus semua halaman dengan "provider"
<AuthProvider>           // ← Satpam yang memegang daftar siapa yang login
  <FavoritesProvider>    // ← Petugas wishlist
    <Navbar />           // ← Menu navigasi atas
    <main>{children}</main>  // ← Konten halaman (bisa berubah)
    <Footer />           // ← Informasi bawah
  </FavoritesProvider>
</AuthProvider>
```

**Analogi:**
> Bayangkan kamu masuk mall. Di pintu, satpam (AuthProvider) akan selalu ada mengawasi. Ada juga petugas wishlist (FavoritesProvider) yang mencatat barang favoritmu. Baru setelah itu kamu bisa jalan-jalan ke berbagai toko (halaman).

---

### 2. 🎪 `page.tsx` (Home) — Lobby Mall

**Lokasi:** `web/src/app/page.tsx`

**Tanggung Jawab:**
Ini adalah **lobby mall** — halaman pertama yang dilihat pengunjung. Di sini ditampilkan:
- Banner promo (Hero Section)
- Produk terbaru
- Toko unggulan

**Logika Penting:**
```tsx
// Baris 13-27: Mengambil data dari gudang (Supabase)
async function getHomeData() {
  const supabase = await createServerClient();  // ← Koneksi ke gudang
  
  const [productsRes, shopsRes] = await Promise.all([
    supabase.from("products").select("*").limit(8),  // ← Ambil 8 produk terbaru
    supabase.from("shops").select("*").limit(6),     // ← Ambil 6 toko terbaru
  ]);
  
  return { products: ..., shops: ... };
}
```

**Analogi:**
> Saat kamu masuk lobby mall, ada display LED besar menampilkan promo (Hero). Di sekitarnya ada etalase menampilkan produk baru dari berbagai toko. Semua ini diambil dari gudang (Supabase) sebelum kamu datang.

**Hubungan dengan File Lain:**
```
[User buka website] 
    ↓
layout.tsx (pintu masuk)
    ↓
page.tsx (lobby)
    ↓ memanggil
createServerClient() → Supabase (gudang)
    ↓ data dikirim
<FeaturedProducts /> dan <FeaturedShops />
    ↓ ditampilkan ke
User melihat produk dan toko
```

---

### 3. 👮 `auth.context.tsx` — Satpam Mall

**Lokasi:** `web/src/lib/contexts/auth.context.tsx`

**Tanggung Jawab:**
Ini adalah **satpam mall** yang:
- Memeriksa apakah pengunjung sudah login
- Menyimpan informasi siapa yang sedang login
- Mengatur proses login/logout
- Mengecek izin (user biasa, owner, atau admin)

**Logika Penting:**
```tsx
// Baris 33-48: Mengambil data profil dari database
async function fetchProfile(supabase, authUserId, email) {
  const { data } = await supabase
    .from('profiles')                    // ← Tabel profil pengguna
    .select('id, full_name, role, ...')  // ← Ambil data penting
    .eq('id', authUserId)                // ← Cocokkan dengan ID user
    .single();                           // ← Hanya 1 data
  
  return {
    id: data.id,
    email,
    role: data.role,  // ← 'user', 'owner', atau 'admin'
  };
}
```

```tsx
// Baris 26-27: Fungsi untuk cek izin
hasPermission: (permission: string) => boolean  // ← Boleh akses fitur X?
isRole: (role: User['role']) => boolean         // ← Apakah dia admin/owner?
```

**Analogi:**
> Satpam punya daftar VIP (admin), pemilik toko (owner), dan pengunjung biasa (user). Saat kamu mau masuk ruangan tertentu, satpam akan cek: "Maaf, ruangan ini hanya untuk pemilik toko."

**Hubungan dengan File Lain:**
```
[User klik Login]
    ↓
auth.context.tsx menjalankan login()
    ↓ mengirim email+password ke
Supabase Auth
    ↓ kalau sukses
fetchProfile() mengambil data dari tabel 'profiles'
    ↓
setUser(profile) → user tersimpan di memori
    ↓
Navbar menampilkan nama user
Dashboard bisa diakses
```

---

### 4. 🛒 `cart.ts` — Troli Belanja

**Lokasi:** `web/src/lib/store/cart.ts`

**Tanggung Jawab:**
Ini adalah **troli belanja** yang kamu dorong keliling mall. File ini menggunakan **Zustand** (library state management yang ringan) untuk:
- Menyimpan produk yang mau dibeli
- Menambah/mengurangi jumlah
- Menghitung total harga

**Logika Penting:**
```tsx
// Baris 15-31: Menambah produk ke troli
addItem: (product) =>
  set((state) => {
    // Cek apakah produk sudah ada di troli
    const existing = state.items.find(
      (item) => item.product.id === product.id
    );
    
    if (existing) {
      // Kalau sudah ada, tambah jumlahnya saja
      return {
        items: state.items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }  // ← +1
            : item
        ),
      };
    }
    
    // Kalau belum ada, masukkan baru dengan qty 1
    return { items: [...state.items, { product, quantity: 1 }] };
  }),
```

```tsx
// Baris 59-62: Menghitung total harga
totalPrice: () =>
  get().items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  ),
```

**Analogi:**
> Kamu ambil bunga mawar, masukkan ke troli. Ambil lagi bunga yang sama? Troli tidak membuat slot baru, tapi menambah angka di slot mawar jadi "2". Saat checkout, kasir tinggal hitung: harga × jumlah.

**Hubungan dengan File Lain:**
```
[User klik "Add to Cart" di ProductCard]
    ↓
ProductCard memanggil addItemWithAuth()
    ↓ cek login dulu
auth.context: "Apakah user sudah login?"
    ↓ kalau sudah
cart.ts: addItem(product)
    ↓
Navbar menampilkan badge "3" (jumlah item)
```

---

### 5. 💝 `favorites.context.tsx` — Wishlist

**Lokasi:** `web/src/lib/contexts/favorites.context.tsx`

**Tanggung Jawab:**
Ini adalah **daftar wishlist** — produk yang kamu suka tapi belum mau beli. Bedanya dengan cart: wishlist disimpan di database (permanen), cart disimpan di browser (sementara).

**Logika Penting:**
```tsx
// Mengecek apakah produk sudah di-favorit
isFavorited: (productId) => {
  return favorites.some(fav => fav.product_id === productId);
}

// Toggle favorit (tambah kalau belum, hapus kalau sudah)
toggleFavorite: async (productId) => {
  if (isFavorited(productId)) {
    await removeFromFavorites(productId);  // ← Hapus dari wishlist
  } else {
    await addToFavorites(productId);       // ← Tambah ke wishlist
  }
}
```

**Analogi:**
> Di mall ada fitur "tap untuk suka" — kamu tahan tombol di produk, dan produk itu masuk ke daftar favoritmu yang tersimpan di kartu member. Bedanya dengan troli: wishlist tidak hilang saat kamu pulang.

---

### 6. 🎴 `product-card.tsx` — Kartu Produk di Etalase

**Lokasi:** `web/src/components/product/product-card.tsx`

**Tanggung Jawab:**
Ini adalah **kartu produk** yang ditampilkan di etalase. Setiap kartu menampilkan:
- Foto produk
- Nama dan harga
- Tombol "Add to Cart" 🛒
- Tombol "Favorite" ❤️

**Logika Penting:**
```tsx
// Baris 34-41: Ketika tombol favorit diklik
const handleFavoriteClick = async () => {
  if (!user) {
    // Kalau belum login, minta login dulu
    await addToFavoritesWithAuth(product.id);
    return;
  }
  // Kalau sudah login, toggle favorit
  await toggleFavorite(product.id);
};
```

```tsx
// Baris 22-23: Integrasi dengan store dan context
const { addItemWithAuth } = useCartStore();    // ← Fungsi add to cart
const { isFavorited, toggleFavorite } = useFavorites();  // ← Fungsi favorit
```

**Analogi:**
> Kartu produk seperti **label harga di toko**. Di sana ada foto, nama, harga. Ada juga tombol "mau beli" (keranjang) dan "suka" (hati). Kalau kamu klik hati, warnanya jadi merah. Klik lagi, warnanya hilang.

**Hubungan dengan File Lain:**
```
ProductCard.tsx
    │
    ├── useCartStore() ← dari cart.ts
    │       ↓ addItemWithAuth(product)
    │       → Produk masuk troli
    │
    ├── useFavorites() ← dari favorites.context.tsx
    │       ↓ toggleFavorite(productId)
    │       → API /api/favorites dipanggil
    │       → Data disimpan ke Supabase
    │
    └── useAuth() ← dari auth.context.tsx
            ↓ Cek: user sudah login?
            → Kalau belum, redirect ke /auth/login
```

---

### 7. 📋 `api/cart/route.ts` — Customer Service (Bagian Troli)

**Lokasi:** `web/src/app/api/cart/route.ts`

**Tanggung Jawab:**
Ini adalah **customer service** yang menangani operasi troli di sisi server:
- GET: Ambil daftar isi troli
- POST: Tambah produk ke troli
- DELETE: Hapus produk dari troli

**Logika Penting:**
```tsx
// Baris 22-47: Mengambil isi troli user
export async function GET(request) {
  // 1. Cek apakah user sudah login
  const user = await getAuthUser(request);
  if (!user) {
    return { error: "Unauthorized" };  // ← Belum login, tolak!
  }

  // 2. Ambil data troli dari database
  const { data } = await supabase
    .from("cart_items")
    .select("*, products(*)")  // ← Ambil detail produk juga
    .eq("user_id", user.id);   // ← Hanya troli milik user ini
  
  return { success: true, data };
}
```

**Analogi:**
> Customer service di mall: "Mau lihat isi troli Anda? Boleh lihat kartu member dulu?" (cek auth). Setelah itu, mereka ambilkan daftar dari komputer (database).

---

### 8. 🔌 `supabase/client.ts` & `server.ts` — Koneksi ke Gudang

**Lokasi:** `web/src/lib/supabase/client.ts` dan `server.ts`

**Tanggung Jawab:**
File ini seperti **kabel telepon ke gudang** (Supabase). Ada 2 jenis koneksi:

| File | Digunakan Di | Keamanan |
|------|-------------|----------|
| `client.ts` | Browser (frontend) | Terbatas, mengikuti RLS |
| `server.ts` | Server (API routes) | Bisa lebih banyak akses |

**Logika Penting:**
```tsx
// client.ts — untuk browser
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,     // ← Alamat gudang
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // ← Kunci tamu
  );
}

// server.ts — untuk server
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY     // ← Kunci master
  );
}
```

**Analogi:**
> `client.ts` = Telepon umum di mall. Bisa telepon gudang, tapi cuma bisa minta barang tertentu.
> `server.ts` = Telepon khusus manajer. Bisa akses semua stok, data rahasia, dll.

---

### 9. 🧭 `navbar.tsx` — Papan Navigasi Mall

**Lokasi:** `web/src/components/layout/navbar.tsx`

**Tanggung Jawab:**
Navbar adalah **papan petunjuk arah** di atas setiap halaman:
- Logo & nama mall
- Link ke Beranda, Produk, Toko
- Ikon keranjang dengan badge jumlah item
- Menu user (login/logout, profile)

**Logika Penting:**
```tsx
// Baris 29-33: Mengambil data dari berbagai sumber
const totalItemsRaw = useCartStore((s) => s.totalItems());  // ← Jumlah di troli
const { user, logout, hasPermission } = useAuth();          // ← Info user login
const { getFavoriteCount } = useFavorites();                // ← Jumlah favorit
```

```tsx
// Baris 68-73: Menu navigasi
const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/products", label: "Produk" },
  { href: "/shops", label: "Toko" },
];
```

**Analogi:**
> Navbar seperti **peta mall yang ditempel di dinding**. Di situ ada arah ke lobby, ke area toko, ke toilet. Ada juga badge "3" di ikon troli menunjukkan kamu punya 3 barang di troli.

---

## 🔄 HUBUNGAN ANTAR FILE (Alur Cerita)

### Cerita 1: User Menambah Produk ke Keranjang

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 🎬 SKENARIO: Andi ingin membeli Bunga Mawar                              │
└──────────────────────────────────────────────────────────────────────────┘

1️⃣ Andi buka website
   └─→ layout.tsx: "Selamat datang! Ini navbar dan footer."
   └─→ page.tsx: "Ini produk-produk terbaru." (ambil dari Supabase)

2️⃣ Andi lihat Bunga Mawar Rp 50.000
   └─→ ProductCard menampilkan foto, nama, harga

3️⃣ Andi klik tombol 🛒 "Add to Cart"
   └─→ ProductCard: "Hmm, Andi sudah login belum?"
   └─→ auth.context: "Cek dulu... Ya, Andi sudah login!"

4️⃣ ProductCard memanggil addItem(bunga_mawar)
   └─→ cart.ts: "Mawar belum ada di troli, saya tambahkan!"
   └─→ cart.ts: items = [{product: mawar, quantity: 1}]

5️⃣ Navbar terupdate otomatis
   └─→ Navbar: "Troli sekarang isinya 1 item"
   └─→ Badge "1" muncul di ikon keranjang

6️⃣ Andi klik 🛒 lagi di produk yang sama
   └─→ cart.ts: "Mawar sudah ada, saya tambah quantity jadi 2"
   └─→ Badge jadi "2"
```

### Cerita 2: User Login dan Lihat Dashboard

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 🎬 SKENARIO: Budi adalah pemilik toko, ingin kelola produknya            │
└──────────────────────────────────────────────────────────────────────────┘

1️⃣ Budi buka /auth/login
   └─→ Masukkan email: owner@toko.com, password: ****

2️⃣ auth.context melakukan login()
   └─→ Kirim ke Supabase Auth: "Cek email & password ini"
   └─→ Supabase: "Valid! Ini token-nya"
   └─→ auth.context: fetchProfile() → ambil data dari tabel 'profiles'
   └─→ Data Budi: { role: 'owner', full_name: 'Budi Florist' }

3️⃣ auth.context menyimpan user
   └─→ setUser(budi_profile)
   └─→ Sekarang seluruh website tahu Budi sudah login

4️⃣ Navbar berubah
   └─→ Tombol "Login" hilang, diganti "Halo, Budi"
   └─→ Muncul link "Dashboard" karena Budi adalah owner

5️⃣ Budi klik "Dashboard"
   └─→ ProtectedRoute cek: "Apakah Budi punya role owner?"
   └─→ auth.context: "Ya, Budi adalah owner"
   └─→ Dashboard ditampilkan dengan menu: Produk, Toko, Pesanan
```

### Cerita 3: Data Mengalir dari Database ke Layar

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 🎬 SKENARIO: Menampilkan daftar produk di halaman utama                  │
└──────────────────────────────────────────────────────────────────────────┘

         Browser                    Server                    Database
            │                          │                          │
            │   1. Ketik bloom.id      │                          │
            │ ─────────────────────────>│                          │
            │                          │                          │
            │                          │   2. getHomeData()       │
            │                          │ ─────────────────────────>│
            │                          │                          │
            │                          │   3. SELECT * FROM       │
            │                          │      products LIMIT 8    │
            │                          │ <─────────────────────────│
            │                          │      [8 produk]          │
            │                          │                          │
            │   4. Kirim HTML +        │                          │
            │      data produk         │                          │
            │ <─────────────────────────│                          │
            │                          │                          │
            │   5. Render              │                          │
            │      <ProductCard />     │                          │
            │      x 8                 │                          │
            ▼                          ▼                          ▼
       
       [Layar User]
       ┌─────────────────────────────────┐
       │  🌹 Mawar    🌻 Matahari        │
       │  Rp 50.000   Rp 35.000          │
       │  [🛒] [❤️]   [🛒] [❤️]          │
       └─────────────────────────────────┘
```

---

## 🧩 KESIMPULAN: Bagaimana Semua Bekerja Bersama

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        🏗️ ARSITEKTUR FLOWER MARKETPLACE                     │
└─────────────────────────────────────────────────────────────────────────────┘

                              USER (Browser)
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            NEXT.JS APPLICATION                                │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         LAYOUT (Pembungkus)                              │ │
│  │                                                                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │ │
│  │  │ AuthProvider │  │  Favorites   │  │    Navbar    │                   │ │
│  │  │   (Satpam)   │  │  Provider    │  │ (Navigasi)   │                   │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────────┘                   │ │
│  │         │                 │                                              │ │
│  │         ▼                 ▼                                              │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                         HALAMAN (Page)                              │ │ │
│  │  │                                                                     │ │ │
│  │  │   Home  │  Products  │  Shops  │  Cart  │  Dashboard  │  Admin     │ │ │
│  │  │                                                                     │ │ │
│  │  └───────────────────────────────┬────────────────────────────────────┘ │ │
│  │                                  │                                       │ │
│  │                                  ▼                                       │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                       COMPONENTS                                    │ │ │
│  │  │                                                                     │ │ │
│  │  │  ProductCard  │  ShopCard  │  AuthForms  │  ProductForm  │  ...    │ │ │
│  │  │                                                                     │ │ │
│  │  └───────────────────────────────┬────────────────────────────────────┘ │ │
│  │                                  │                                       │ │
│  └──────────────────────────────────┼───────────────────────────────────────┘ │
│                                     │                                         │
│  ┌──────────────────────────────────┼───────────────────────────────────────┐ │
│  │                          LIB (Alat-Alat)                                 │ │
│  │                                  │                                        │ │
│  │  ┌─────────────┐  ┌──────────────┴────────────┐  ┌────────────────────┐  │ │
│  │  │ Cart Store  │  │      Supabase Client      │  │   Context (Auth,   │  │ │
│  │  │  (Zustand)  │  │   (Koneksi ke Database)   │  │    Favorites)      │  │ │
│  │  └─────────────┘  └──────────────┬────────────┘  └────────────────────┘  │ │
│  │                                  │                                        │ │
│  └──────────────────────────────────┼────────────────────────────────────────┘ │
│                                     │                                          │
│  ┌──────────────────────────────────┼───────────────────────────────────────┐  │
│  │                          API ROUTES                                       │  │
│  │                                  │                                        │  │
│  │  /api/cart  │  /api/favorites  │  /api/products  │  /api/admin/...      │  │
│  │                                  │                                        │  │
│  └──────────────────────────────────┼────────────────────────────────────────┘  │
│                                     │                                           │
└─────────────────────────────────────┼───────────────────────────────────────────┘
                                      │
                                      ▼
                        ┌─────────────────────────┐
                        │       SUPABASE          │
                        │    (Cloud Database)     │
                        │                         │
                        │  ┌───────┐ ┌─────────┐  │
                        │  │ Auth  │ │ Postgres│  │
                        │  └───────┘ └─────────┘  │
                        │                         │
                        │  Tables:                │
                        │  - users/profiles       │
                        │  - shops                │
                        │  - products             │
                        │  - cart_items           │
                        │  - favorites            │
                        │  - applications         │
                        └─────────────────────────┘
```

### Ringkasan Peran Setiap Bagian:

| Bagian | File Utama | Peran | Analogi Mall |
|--------|------------|-------|--------------|
| **Layout** | `layout.tsx` | Membungkus semua halaman | Bangunan mall |
| **Pages** | `page.tsx`, `products/page.tsx` | Konten tiap halaman | Lantai/area mall |
| **Components** | `ProductCard`, `Navbar` | UI yang bisa dipakai ulang | Furnitur & dekorasi |
| **Contexts** | `auth.context`, `favorites.context` | State global (shared data) | Sistem keamanan & membership |
| **Store** | `cart.ts` | State lokal (troli) | Troli belanja |
| **API Routes** | `/api/cart`, `/api/favorites` | Handler request backend | Customer service |
| **Supabase Client** | `client.ts`, `server.ts` | Koneksi ke database | Telepon ke gudang |
| **Supabase** | (Cloud) | Database & Auth | Gudang + kantor |

---

## 💡 Tips untuk Pemula

1. **Mulai dari `layout.tsx`** — Ini adalah "root" dari semua halaman. Pahami strukturnya dulu.

2. **Ikuti alur data** — Dari mana data berasal? Ke mana data pergi? Biasanya: Supabase → API Route → Page → Component.

3. **Pahami Context vs Store** — Context (AuthProvider) untuk data yang jarang berubah. Store (Zustand) untuk data yang sering berubah.

4. **Jangan takut baca error** — Error message biasanya bilang file mana yang bermasalah dan di baris berapa.

5. **Gunakan console.log** — Kalau bingung, tambahkan `console.log(data)` untuk lihat isi variabel.

---

## ❓ Masih Bingung?

Kalau ada bagian yang masih belum jelas, jangan ragu untuk bertanya! Saya siap menjelaskan dengan analogi lain atau contoh kode yang lebih detail.

Selamat belajar! 🌸

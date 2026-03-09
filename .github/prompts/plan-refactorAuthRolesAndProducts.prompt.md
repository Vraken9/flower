## Plan: Refactor Auth, Roles & Products

Berfokus pada perbaikan registrasi, otorisasi role-based, manajemen toko/produk, implementasi Zod untuk validasi, dan Redis untuk mekanisme logout cepat.

**Steps**
1. **Pendaftaran (User & Toko)**
   - Di [backend/controllers/auth.controller.js](backend/controllers/auth.controller.js), pastikan saat user registrasi (`register`), role default pada tabel `profiles` di-set ke `USER`.
   - Di [backend/controllers/owner.controller.js](backend/controllers/owner.controller.js) (`createShop`), tambahkan pengecekan apakah user sudah memiliki relasi di tabel `shops`. Jika berhasil membuat toko, jalankan update role menjadi `owner` pada tabel `profiles`.
2. **Product CRUD & Otorisasi**
   - Modifikasi [backend/middlewares/upload.middleware.js](backend/middlewares/upload.middleware.js) agar `limits.fileSize` menjadi 10MB (10 * 1024 * 1024). Tambahkan penanganan error khusus untuk limit file tersebut (mengembalikan status 413).
   - Di [backend/controllers/owner.controller.js](backend/controllers/owner.controller.js) atau [backend/controllers/product.controller.js](backend/controllers/product.controller.js), filter fungsi fetch berdasarkan sesi. Jika user memiliki role `owner`, tampilkan WHERE `shop_id = id_toko_milik_user`. Jika `admin`, abaikan filter ini.
   - Paksakan assignment `shop_id` produk menggunakan data dari sesi backend (`req.user.id` yang diresolusi menjadi `shop_id`) pada saat tambah atau edit produk, abaikan input `shop_id` dari client.
3. **Profil User & Toko**
   - Perbarui fitur update profil di [backend/controllers/auth.controller.js](backend/controllers/auth.controller.js) (`updateProfile`) untuk menangani logika multi-role secara dinamis.
   - Tambahkan fungsi update informasi toko pada [backend/controllers/owner.controller.js](backend/controllers/owner.controller.js) agar `owner` bisa mengubah `name`, `description`, `address`, dan `logo` tokonya sendiri.
4. **Validasi Input dengan Zod**
   - Buat middleware sentral `validateMiddleware` misalnya di [backend/middlewares/validate.middleware.js](backend/middlewares/validate.middleware.js).
   - Buat skema dengan Zod di `backend/utils/schemas.js` untuk memastikan field `name`, `price`, dan `stock` valid saat membuat produk.
5. **Fast Logout (Redis)**
   - Buat fungsi logout di [backend/controllers/auth.controller.js](backend/controllers/auth.controller.js) untuk memanggil `supabase.auth.signOut()` dan memasukkan token yang sedang dipakai ke dalam list Redis blocklist.
   - Tambahkan pengecekan Redis di [backend/middlewares/auth.middleware.js](backend/middlewares/auth.middleware.js#L1) (tolak akses jika token ada di blocklist).
   - Pastikan di sisi Next.js ([web/src/app/actions/auth.ts](web/src/app/actions/auth.ts)) menghapus cookie dan localStorage secara instan.

**Verification**
- Test Sign Up user baru.
- Test buat toko (harus mengubah role menjadi `owner`), dan test jika mencoba membuat toko ke-2 akan ditolak.
- Upload foto produk 11MB dan pastikan gagal dengan pesan error jelas.
- Login sebagai Owner A dan pastikan tidak bisa edit produk Owner B.
- Login sebagai Admin dan pastikan semua produk dapat terlihat/diakses.
- Test logout, coba gunakan JWT di postman; pastikan terblokir oleh Redis.

**Decisions**
- Dipilih menggunakan **Zod** untuk validasi schema API sesuai preferensi.
- Dipilih menggunakan konsep **Redis blocklist** untuk sistem logout yang benar-benar instan dan aman pasca-logout dari Supabase.

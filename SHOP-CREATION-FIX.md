# 🛠️ Perbaikan Fitur Pembuatan Toko & Form Registrasi

## 📋 Ringkasan
Dokumen ini menjelaskan masalah yang ditemukan pada fitur pembuatan toko dan perbaikan yang dilakukan, serta peningkatan UX pada form registrasi.

---

## ❌ **Masalah yang Ditemukan**

### 1️⃣ **API Endpoint untuk Shop Tidak Ada**
**Lokasi**: `web/src/components/dashboard/shop-form.tsx`

**Masalah**:
- Form pembuatan toko mencoba POST ke endpoint yang tidak ada:
  ```typescript
  // ❌ ENDPOINT INI TIDAK ADA!
  const url = "http://localhost:3000/api/admin/shops"
  ```
- URL hardcoded dengan `localhost:3000` (akan error di production)
- Tidak ada validasi role `owner` sebelum membuat toko
- Form tidak mengirim `owner_id` yang diperlukan oleh RLS policy

**Dampak**:
- ❌ Owner tidak bisa membuat toko baru
- ❌ Owner tidak bisa update informasi toko
- ❌ Form selalu error karena endpoint tidak ditemukan

---

### 2️⃣ **RLS Policy Supabase Memerlukan owner_id**
**Lokasi**: `supabase/migrations/002_enable_rls_and_policies.sql`

**Policy yang Ada**:
```sql
CREATE POLICY shops_insert_owner
ON shops FOR INSERT
WITH CHECK (
  auth.uid() = owner_id AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
);
```

**Masalah**:
- Policy ini **mengharuskan** `owner_id` sama dengan user yang login
- Policy ini **mengharuskan** user memiliki role `'owner'`
- Form tidak mengirim `owner_id`, sehingga RLS akan selalu **BLOCK** insert

---

### 3️⃣ **Form Registrasi Kurang User-Friendly**
**Lokasi**: `web/src/components/auth/auth-forms.tsx`

**Masalah**:
- ❌ Tidak ada field konfirmasi password
- ❌ Tidak ada tombol show/hide password
- ❌ User bisa salah ketik password tanpa sadar
- ❌ UX kurang bagus untuk form sensitif

---

## ✅ **Perbaikan yang Dilakukan**

### 1️⃣ **Membuat API Endpoint `/api/owner/shop`**
**File Baru**: `web/src/app/api/owner/shop/route.ts`

**Fitur**:
- ✅ **GET** `/api/owner/shop` - Ambil data toko owner saat ini
- ✅ **POST** `/api/owner/shop` - Buat toko baru
- ✅ **PUT** `/api/owner/shop` - Update toko yang sudah ada

**Keamanan**:
```typescript
// 1. Cek autentikasi
const { data: { user } } = await supabase.auth.getUser()
if (!user) return error 401

// 2. Cek role owner
const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", user.id)
  .single()

if (!profile || profile.role !== "owner") {
  return error 403 // Forbidden
}

// 3. Cek apakah sudah punya toko
const { data: existingShop } = await supabase
  .from("shops")
  .select("id")
  .eq("owner_id", user.id)
  .single()

if (existingShop) {
  return error "You already have a shop"
}

// 4. Insert dengan owner_id dari user yang login
await supabase.from("shops").insert({
  owner_id: user.id, // ✅ Otomatis dari session
  name, description, location, image_url,
  is_active: true,
})
```

**Validasi**:
- ✅ User harus login (cek JWT token)
- ✅ User harus punya role `'owner'`
- ✅ Satu owner hanya boleh punya satu toko
- ✅ Nama toko wajib diisi
- ✅ `owner_id` otomatis diambil dari session (tidak bisa di-fake)

---

### 2️⃣ **Update Shop Form**
**File**: `web/src/components/dashboard/shop-form.tsx`

**Perubahan**:
```typescript
// ❌ SEBELUM (Hardcoded localhost)
const url = isEditing
  ? `http://localhost:3000/api/admin/shops/${shop.id}`
  : "http://localhost:3000/api/admin/shops"

// ✅ SESUDAH (Dynamic path)
const url = "/api/owner/shop"
```

**Peningkatan**:
- ✅ URL dinamis (otomatis mengikuti domain)
- ✅ Tidak perlu kirim `shop.id` untuk update (API tahu dari session)
- ✅ Error handling lebih baik (tampilkan pesan dari server)
- ✅ Auto-refresh setelah berhasil buat toko
- ✅ Pesan success/error dari API response

---

### 3️⃣ **Peningkatan Form Registrasi**
**File**: `web/src/components/auth/auth-forms.tsx`

#### **A. Tambah Field Konfirmasi Password**
```typescript
const [confirmPassword, setConfirmPassword] = useState('')

// Validasi sebelum submit
if (password !== confirmPassword) {
  setError('Password dan konfirmasi password tidak cocok')
  return
}
```

**Fitur**:
- ✅ Field baru "Konfirmasi Password"
- ✅ Validasi real-time (border merah jika tidak cocok)
- ✅ Pesan error jika password tidak match
- ✅ Tidak bisa submit jika password berbeda

---

#### **B. Tambah Tombol Show/Hide Password**
```typescript
const [showPassword, setShowPassword] = useState(false)
const [showConfirmPassword, setShowConfirmPassword] = useState(false)

// Tombol toggle dengan icon Eye/EyeOff
<button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute right-3 top-1/2 -translate-y-1/2"
>
  {showPassword ? <EyeOff /> : <Eye />}
</button>
```

**Fitur**:
- ✅ Icon mata untuk toggle visibility
- ✅ Password field dan Confirm Password punya toggle sendiri
- ✅ Tombol ada di kanan dalam input (UX modern)
- ✅ Accessibility: `aria-label` untuk screen reader

---

#### **C. Juga Update Form Login**
**Bonus**: Form login juga dapat tombol show/hide password untuk konsistensi UX.

---

## 🎯 **Cara Kerja yang Benar**

### **Alur Pembuatan Toko**:
```
1. User register → role default = 'user'
2. User apply jadi owner di /apply-owner
3. Admin approve → role berubah jadi 'owner'
4. Owner buka /dashboard/shop
5. Klik "Buat Toko"
6. Isi form → Submit
7. Frontend POST ke /api/owner/shop
8. Backend:
   ✓ Cek autentikasi (JWT token)
   ✓ Cek role = 'owner'
   ✓ Cek belum punya toko
   ✓ Insert dengan owner_id = user.id
9. RLS Policy:
   ✓ auth.uid() == owner_id ✅
   ✓ role == 'owner' ✅
   ✓ INSERT BERHASIL ✅
10. Frontend dapat response success
11. Auto-refresh untuk tampilkan data toko baru
```

---

## 📊 **Perbandingan Sebelum & Sesudah**

| Aspek | ❌ Sebelum | ✅ Sesudah |
|-------|-----------|-----------|
| **API Endpoint** | Tidak ada | `/api/owner/shop` (GET, POST, PUT) |
| **URL** | Hardcoded localhost | Dynamic `/api/owner/shop` |
| **Validasi Role** | Tidak ada | Cek role `owner` di backend |
| **owner_id** | Tidak terkirim | Otomatis dari session |
| **RLS Policy** | Akan block | Sesuai requirement policy |
| **Error Handling** | Generic message | Pesan spesifik dari server |
| **Auto-refresh** | Manual | Otomatis setelah create |
| **Password Confirm** | Tidak ada | Ada + validasi real-time |
| **Show Password** | Tidak ada | Ada (Eye icon toggle) |

---

## 🔐 **Keamanan yang Diterapkan**

### **1. Authentication**
```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) return 401 Unauthorized
```
- ✅ Cek JWT token dari Supabase
- ✅ Token di-verify server-side
- ✅ Tidak bisa bypass dengan Postman/curl

### **2. Authorization**
```typescript
if (profile.role !== 'owner') return 403 Forbidden
```
- ✅ Hanya role `owner` yang boleh akses
- ✅ Role disimpan di database (tidak bisa di-fake)
- ✅ Double-check di RLS policy Supabase

### **3. Ownership Validation**
```typescript
owner_id: user.id // Dari session, bukan dari request body
```
- ✅ `owner_id` tidak pernah dari frontend
- ✅ Selalu dari `auth.uid()` (session server-side)
- ✅ Owner hanya bisa edit toko sendiri

### **4. Row Level Security (RLS)**
```sql
-- Policy di Supabase
WITH CHECK (auth.uid() = owner_id AND role = 'owner')
```
- ✅ Extra layer di database level
- ✅ Bahkan jika API di-hack, RLS tetap protect
- ✅ Owner tidak bisa edit toko owner lain

---

## 🧪 **Cara Testing**

### **Test 1: Owner Membuat Toko**
```bash
# 1. Login sebagai owner
Email: owner.edelweis@gmail.com
Password: owner123456

# 2. Buka /dashboard/shop

# 3. Klik "Buat Toko"

# 4. Isi form:
Nama Toko: Toko Bunga Saya
Deskripsi: Menjual berbagai bunga segar
Lokasi: Jakarta
Image URL: https://example.com/shop.jpg

# 5. Submit

# ✅ Harapan:
- Success message muncul
- Halaman auto-refresh
- Toko muncul di list
```

### **Test 2: User Biasa Tidak Bisa Buat Toko**
```bash
# 1. Login sebagai user biasa
Email: buyer@gmail.com
Password: buyer123456

# 2. Coba akses /dashboard/shop

# ✅ Harapan:
- Redirect atau 403 Forbidden
- Tidak bisa akses form
```

### **Test 3: Owner Tidak Bisa Buat Toko Kedua**
```bash
# 1. Login sebagai owner yang sudah punya toko
Email: owner.edelweis@gmail.com

# 2. Buka /dashboard/shop

# 3. Coba buat toko lagi

# ✅ Harapan:
- Error message: "You already have a shop"
- Form tidak submit
```

### **Test 4: Password Confirmation**
```bash
# 1. Buka /auth/register

# 2. Isi form:
Nama: Test User
Email: test@example.com
Password: password123
Konfirmasi Password: password456 (BERBEDA)

# ✅ Harapan:
- Border merah di field konfirmasi
- Pesan "Password tidak cocok"
- Tidak bisa submit

# 3. Ubah konfirmasi jadi sama
Konfirmasi Password: password123

# ✅ Harapan:
- Border hijau/normal
- Pesan error hilang
- Bisa submit
```

### **Test 5: Show/Hide Password**
```bash
# 1. Buka /auth/login atau /auth/register

# 2. Ketik password di field password

# 3. Klik icon mata di kanan

# ✅ Harapan:
- Password visible (text mode)
- Icon berubah dari Eye ke EyeOff

# 4. Klik lagi

# ✅ Harapan:
- Password hidden (password mode)
- Icon kembali ke Eye
```

---

## 📝 **Files yang Diubah**

### **1. File Baru**
- ✅ `web/src/app/api/owner/shop/route.ts` - API endpoint shop

### **2. File yang Diubah**
- ✅ `web/src/components/dashboard/shop-form.tsx` - Form buat/edit toko
- ✅ `web/src/components/auth/auth-forms.tsx` - Login & Register form

---

## 🚀 **Next Steps (Opsional)**

### **Peningkatan Lebih Lanjut**:
1. **Upload Image**
   - Saat ini image menggunakan URL
   - Bisa ditambah fitur upload file ke Supabase Storage

2. **Shop Verification**
   - Admin bisa verify/approve toko sebelum active
   - Tambah field `is_verified` di shops table

3. **Shop Settings**
   - Jam buka/tutup toko
   - Contact info (WhatsApp, Instagram)
   - Shipping options

4. **Analytics**
   - Total produk di toko
   - Total sales
   - Visitor count

---

## ✅ **Kesimpulan**

### **Masalah Awal**:
- ❌ API endpoint tidak ada
- ❌ Form tidak bisa submit
- ❌ RLS policy akan block
- ❌ Security issue (owner_id bisa di-fake)
- ❌ UX buruk (no password confirmation)

### **Solusi yang Diterapkan**:
- ✅ Buat API endpoint lengkap dengan validasi
- ✅ Update form menggunakan endpoint yang benar
- ✅ Security terjamin (auth + role + RLS)
- ✅ UX lebih baik (confirm password + show/hide)
- ✅ Error handling yang informatif

### **Hasil**:
🎉 **Fitur pembuatan toko sekarang berfungsi dengan benar!**
🎉 **Form registrasi lebih user-friendly!**
🎉 **Security terjaga dengan baik!**

---

**Dibuat pada**: ${new Date().toLocaleDateString('id-ID', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}

**Developer**: GitHub Copilot (Claude Sonnet 4.5)

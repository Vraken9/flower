-- ============================================
--  🌸 FLOWER MARKETPLACE
--  Database Migration Script
--  Jalankan di Supabase SQL Editor
-- ============================================

-- ──────────────────────────────────────────
--  1. TABEL PROFILES
--  Menyimpan data profil user (extend dari auth.users)
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL DEFAULT 'User',
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'user'
              CHECK (role IN ('user', 'owner', 'admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE  public.profiles IS 'Profil user yang terhubung dengan Supabase Auth';
COMMENT ON COLUMN public.profiles.role IS 'Role: user (pembeli), owner (pemilik toko), admin';

-- ──────────────────────────────────────────
--  2. TAMBAH KOLOM owner_id KE TABEL SHOPS
--  Menghubungkan toko dengan pemiliknya
-- ──────────────────────────────────────────
ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.shops.owner_id IS 'ID pemilik toko (referensi ke profiles)';

-- ──────────────────────────────────────────
--  3. ENABLE ROW LEVEL SECURITY (RLS)
-- ──────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────
--  4. POLICIES UNTUK PROFILES
-- ──────────────────────────────────────────

-- Semua orang bisa lihat profil (untuk tampilkan nama owner, dll)
CREATE POLICY "Profiles: public read"
  ON public.profiles FOR SELECT
  USING (true);

-- User hanya bisa update profil sendiri
CREATE POLICY "Profiles: self update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Insert profil hanya saat registrasi (via trigger atau service role)
CREATE POLICY "Profiles: insert own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ──────────────────────────────────────────
--  5. TRIGGER: AUTO-CREATE PROFILE SAAT REGISTER
--  Setiap kali user baru dibuat di auth.users,
--  otomatis buat profil di tabel profiles
-- ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hapus trigger lama jika ada, lalu buat ulang
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ──────────────────────────────────────────
--  6. TAMBAH KOLOM BARU KE TABEL PRODUCTS
--  Kolom category dan stock belum ada di tabel lama
-- ──────────────────────────────────────────
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Lainnya';

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;

-- ──────────────────────────────────────────
--  7. INDEX UNTUK PERFORMA
-- ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_role     ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_shops_owner_id    ON public.shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_products_shop_id  ON public.products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- ──────────────────────────────────────────
--  8. (OPSIONAL) BUAT ADMIN PERTAMA
--  Ganti 'YOUR_USER_ID' dengan UUID user yang
--  sudah terdaftar di Supabase Auth
-- ──────────────────────────────────────────
-- UPDATE public.profiles
--   SET role = 'admin', updated_at = NOW()
--   WHERE id = 'YOUR_USER_ID';

-- ============================================
--  ✅ Migration selesai!
-- ============================================

-- ============================================
-- FIX: Infinite Recursion in Applications Policies
-- Jalankan di Supabase Dashboard > SQL Editor
-- ============================================

-- Step 1: DROP semua policy yang bermasalah
DROP POLICY IF EXISTS "applications_select_own" ON applications;
DROP POLICY IF EXISTS "applications_select_admin" ON applications;
DROP POLICY IF EXISTS "applications_insert_own" ON applications;
DROP POLICY IF EXISTS "applications_update_admin" ON applications;

-- Step 2: Buat ulang policies tanpa recursion
-- Menggunakan query langsung ke profiles (tanpa function di schema auth)

-- Users dapat melihat aplikasi mereka sendiri
CREATE POLICY "applications_select_own"
  ON applications FOR SELECT
  USING (auth.uid() = user_id);

-- Admin dapat melihat semua aplikasi
-- Query langsung ke profiles untuk menghindari infinite recursion
CREATE POLICY "applications_select_admin"
  ON applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users dapat submit aplikasi (TANPA cek pending - akan dicek di aplikasi)
CREATE POLICY "applications_insert_own"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin dapat update aplikasi (approve/reject)
CREATE POLICY "applications_update_admin"
  ON applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Step 3: Buat function untuk cek pending application (untuk aplikasi)
-- Function ini digunakan di backend untuk validasi sebelum insert
CREATE OR REPLACE FUNCTION public.has_pending_application(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM applications
    WHERE user_id = p_user_id AND status = 'pending'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Applications policies fixed successfully!' as status;

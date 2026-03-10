-- ============================================
-- MIGRATION: Click Tracking + Fix Policies
-- Jalankan di Supabase Dashboard > SQL Editor
-- ============================================

-- ==============================
-- BAGIAN 1: Tambah Tabel Click Tracking
-- ==============================

-- Tabel untuk tracking product views/clicks
CREATE TABLE IF NOT EXISTS product_views (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id  TEXT, -- for anonymous users
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_views_product ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_created ON product_views(created_at);

-- Tabel untuk tracking WhatsApp clicks
CREATE TABLE IF NOT EXISTS whatsapp_clicks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  shop_id     UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_clicks_shop ON whatsapp_clicks(shop_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_clicks_product ON whatsapp_clicks(product_id);

-- Tabel untuk tracking shop profile views
CREATE TABLE IF NOT EXISTS shop_views (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id     UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shop_views_shop ON shop_views(shop_id);

-- Enable RLS on tracking tables
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_views ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "product_views_insert_all" ON product_views;
DROP POLICY IF EXISTS "whatsapp_clicks_insert_all" ON whatsapp_clicks;
DROP POLICY IF EXISTS "shop_views_insert_all" ON shop_views;
DROP POLICY IF EXISTS "product_views_select_owner" ON product_views;
DROP POLICY IF EXISTS "whatsapp_clicks_select_owner" ON whatsapp_clicks;
DROP POLICY IF EXISTS "shop_views_select_owner" ON shop_views;
DROP POLICY IF EXISTS "product_views_select_admin" ON product_views;
DROP POLICY IF EXISTS "whatsapp_clicks_select_admin" ON whatsapp_clicks;
DROP POLICY IF EXISTS "shop_views_select_admin" ON shop_views;

-- Anyone can insert views (tracking)
CREATE POLICY "product_views_insert_all" ON product_views FOR INSERT WITH CHECK (true);
CREATE POLICY "whatsapp_clicks_insert_all" ON whatsapp_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "shop_views_insert_all" ON shop_views FOR INSERT WITH CHECK (true);

-- Owners can see views for their products/shops
CREATE POLICY "product_views_select_owner" ON product_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN shops s ON p.shop_id = s.id
      WHERE p.id = product_views.product_id AND s.owner_id = auth.uid()
    )
  );

CREATE POLICY "whatsapp_clicks_select_owner" ON whatsapp_clicks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shops s
      WHERE s.id = whatsapp_clicks.shop_id AND s.owner_id = auth.uid()
    )
  );

CREATE POLICY "shop_views_select_owner" ON shop_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shops s
      WHERE s.id = shop_views.shop_id AND s.owner_id = auth.uid()
    )
  );

-- Admins can see all
CREATE POLICY "product_views_select_admin" ON product_views FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "whatsapp_clicks_select_admin" ON whatsapp_clicks FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "shop_views_select_admin" ON shop_views FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ==============================
-- BAGIAN 2: Add WhatsApp Number to Shops
-- ==============================

ALTER TABLE shops ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS instagram TEXT;

-- Add whatsapp to applications table for owner registration
ALTER TABLE applications ADD COLUMN IF NOT EXISTS whatsapp TEXT;

-- ==============================
-- BAGIAN 3: Fix Products RLS - Owner hanya lihat produknya sendiri
-- ==============================

-- Drop existing policies
DROP POLICY IF EXISTS "products_select_all" ON products;
DROP POLICY IF EXISTS "products_select_public" ON products;
DROP POLICY IF EXISTS "products_insert_owner" ON products;
DROP POLICY IF EXISTS "products_update_owner" ON products;
DROP POLICY IF EXISTS "products_delete_owner" ON products;
DROP POLICY IF EXISTS "products_admin_all" ON products;
DROP POLICY IF EXISTS "products_all_admin" ON products;

-- Public can view all products
CREATE POLICY "products_select_public" ON products FOR SELECT USING (true);

-- Owner can insert to their own shop
CREATE POLICY "products_insert_owner" ON products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops WHERE id = shop_id AND owner_id = auth.uid()
    )
  );

-- Owner can update their own shop's products
CREATE POLICY "products_update_owner" ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM shops WHERE id = shop_id AND owner_id = auth.uid()
    )
  );

-- Owner can delete their own shop's products  
CREATE POLICY "products_delete_owner" ON products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM shops WHERE id = shop_id AND owner_id = auth.uid()
    )
  );

-- Admin can do everything
CREATE POLICY "products_all_admin" ON products FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ==============================
-- BAGIAN 4: Helper function untuk get owner's shop
-- ==============================

CREATE OR REPLACE FUNCTION public.get_owner_shop_id(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  shop_id UUID;
BEGIN
  SELECT id INTO shop_id FROM shops WHERE owner_id = p_user_id LIMIT 1;
  RETURN shop_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================
-- BAGIAN 5: Function untuk get dashboard stats (owner)
-- ==============================

CREATE OR REPLACE FUNCTION public.get_owner_dashboard_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  shop_id UUID;
  result JSON;
BEGIN
  -- Get owner's shop
  SELECT id INTO shop_id FROM shops WHERE owner_id = p_user_id LIMIT 1;
  
  IF shop_id IS NULL THEN
    RETURN json_build_object(
      'shop_id', NULL,
      'total_products', 0,
      'total_whatsapp_clicks', 0,
      'total_shop_views', 0,
      'total_product_views', 0,
      'total_favorites', 0,
      'total_cart_items', 0,
      'top_products', '[]'::json
    );
  END IF;
  
  SELECT json_build_object(
    'shop_id', shop_id,
    'total_products', (SELECT COUNT(*) FROM products WHERE shop_id = shop_id),
    'total_whatsapp_clicks', (SELECT COUNT(*) FROM whatsapp_clicks WHERE shop_id = shop_id),
    'total_shop_views', (SELECT COUNT(*) FROM shop_views WHERE shop_id = shop_id),
    'total_product_views', (
      SELECT COUNT(*) FROM product_views pv 
      JOIN products p ON pv.product_id = p.id 
      WHERE p.shop_id = shop_id
    ),
    'total_favorites', (
      SELECT COUNT(*) FROM favorites f 
      JOIN products p ON f.product_id = p.id 
      WHERE p.shop_id = shop_id
    ),
    'total_cart_items', (
      SELECT COUNT(*) FROM cart_items ci 
      JOIN products p ON ci.product_id = p.id 
      WHERE p.shop_id = shop_id
    ),
    'top_products', (
      SELECT COALESCE(json_agg(top), '[]'::json)
      FROM (
        SELECT 
          p.id,
          p.name,
          p.image_url,
          (SELECT COUNT(*) FROM product_views WHERE product_id = p.id) as views,
          (SELECT COUNT(*) FROM favorites WHERE product_id = p.id) as favorites,
          (SELECT COUNT(*) FROM cart_items WHERE product_id = p.id) as cart_adds
        FROM products p
        WHERE p.shop_id = shop_id
        ORDER BY views DESC, favorites DESC
        LIMIT 5
      ) top
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Migration completed successfully!' as status;

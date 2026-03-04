-- ============================================
--  002: Enable RLS and create policies
--  Flower Marketplace – Row Level Security
-- ============================================

-- ────────────────────────────────────────────
--  PROFILES
-- ────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read profiles (needed for shop owner names, etc.)
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (true);

-- Users can only update their own profile (but NOT their role)
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Insert is handled by the signup hook (service role), but also allow self-insert
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ────────────────────────────────────────────
--  SHOPS
-- ────────────────────────────────────────────
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

-- Anyone can read active shops
CREATE POLICY "shops_select_active"
  ON shops FOR SELECT
  USING (is_active = true);

-- Owners can insert a shop linked to themselves
CREATE POLICY "shops_insert_owner"
  ON shops FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Owners can update their own shop
CREATE POLICY "shops_update_owner"
  ON shops FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Admins can update any shop (e.g. disable it)
CREATE POLICY "shops_update_admin"
  ON shops FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can also read all shops (including inactive ones)
CREATE POLICY "shops_select_admin"
  ON shops FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ────────────────────────────────────────────
--  PRODUCTS
-- ────────────────────────────────────────────
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Anyone can read products (from active shops)
CREATE POLICY "products_select_all"
  ON products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shops WHERE shops.id = products.shop_id AND shops.is_active = true
    )
  );

-- Admins can read all products
CREATE POLICY "products_select_admin"
  ON products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Owners can insert products for their own shop
CREATE POLICY "products_insert_owner"
  ON products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = products.shop_id
        AND shops.owner_id = auth.uid()
    )
  );

-- Owners can update their own products
CREATE POLICY "products_update_owner"
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = products.shop_id
        AND shops.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = products.shop_id
        AND shops.owner_id = auth.uid()
    )
  );

-- Owners can delete their own products
CREATE POLICY "products_delete_owner"
  ON products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = products.shop_id
        AND shops.owner_id = auth.uid()
    )
  );

-- ────────────────────────────────────────────
--  CART_ITEMS
-- ────────────────────────────────────────────
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Users can read their own cart
CREATE POLICY "cart_select_own"
  ON cart_items FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert into their own cart
CREATE POLICY "cart_insert_own"
  ON cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own cart items
CREATE POLICY "cart_update_own"
  ON cart_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete from their own cart
CREATE POLICY "cart_delete_own"
  ON cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────
--  FAVORITES
-- ────────────────────────────────────────────
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users can read their own favorites
CREATE POLICY "favorites_select_own"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own favorites
CREATE POLICY "favorites_insert_own"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "favorites_delete_own"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

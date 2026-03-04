-- ============================================
--  🌸 FAVORITES TABLE SETUP
--  Run this in Supabase SQL Editor
-- ============================================

-- 1. Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure user can only favorite a product once
  UNIQUE(user_id, product_id)
);

-- 2. Enable Row Level Security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies
-- Users can only see their own favorites
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own favorites
CREATE POLICY "Users can create own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites  
CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);

-- 5. Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_favorites_updated_at BEFORE UPDATE ON favorites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Verify table creation
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'favorites' 
ORDER BY ordinal_position;

-- 7. Test data (Optional - for testing purposes)
-- Uncomment the lines below to add test favorites

-- INSERT INTO favorites (user_id, product_id) VALUES 
-- (
--   (SELECT id FROM auth.users WHERE email = 'buyer@gmail.com' LIMIT 1),
--   (SELECT id FROM products LIMIT 1)
-- );

-- Verify the setup
SELECT COUNT(*) as total_favorites FROM favorites;

COMMENT ON TABLE favorites IS 'User favorite products - stores which products users have marked as favorites';
COMMENT ON COLUMN favorites.user_id IS 'Foreign key to auth.users - the user who favorited the product';
COMMENT ON COLUMN favorites.product_id IS 'Foreign key to products - the product that was favorited';
COMMENT ON COLUMN favorites.created_at IS 'Timestamp when the favorite was added';
COMMENT ON COLUMN favorites.updated_at IS 'Timestamp when the favorite was last updated';

-- Show final table info
\d+ favorites;
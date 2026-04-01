-- =============================================
-- Migration 010: Shop Categories and Branches
-- Run this in Supabase SQL Editor
-- =============================================

-- Add category_id and parent_shop_id to shops
ALTER TABLE shops ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS parent_shop_id uuid REFERENCES shops(id) ON DELETE SET NULL;

-- Optionally, we can also add a foreign key index for better performance
CREATE INDEX IF NOT EXISTS idx_shops_category_id ON shops(category_id);
CREATE INDEX IF NOT EXISTS idx_shops_parent_shop_id ON shops(parent_shop_id);

-- ============================================
--  004: Fix missing is_active column in shops
--  This column is required by RLS policies
-- ============================================

-- Add is_active column if it doesn't exist
ALTER TABLE shops ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Add updated_at column if it doesn't exist  
ALTER TABLE shops ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Ensure all existing shops are active
UPDATE shops SET is_active = true WHERE is_active IS NULL;

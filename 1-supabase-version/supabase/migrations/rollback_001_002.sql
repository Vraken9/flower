-- ============================================
--  ROLLBACK for migrations 001 & 002
--  Run this to undo all DDL from both files
--  WARNING: This drops ALL data in these tables
-- ============================================

-- Drop policies first (002)
DO $$
DECLARE
  pol RECORD;
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['favorites','cart_items','products','shops','profiles'] LOOP
    FOR pol IN
      SELECT policyname FROM pg_policies WHERE tablename = tbl
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, tbl);
    END LOOP;
    EXECUTE format('ALTER TABLE IF EXISTS %I DISABLE ROW LEVEL SECURITY', tbl);
  END LOOP;
END
$$;

-- Drop triggers
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS trg_shops_updated_at    ON shops;
DROP TRIGGER IF EXISTS trg_products_updated_at ON products;

-- Drop tables in dependency order (001)
DROP TABLE IF EXISTS favorites   CASCADE;
DROP TABLE IF EXISTS cart_items   CASCADE;
DROP TABLE IF EXISTS products     CASCADE;
DROP TABLE IF EXISTS shops        CASCADE;
DROP TABLE IF EXISTS profiles     CASCADE;

-- Drop the trigger function
DROP FUNCTION IF EXISTS update_updated_at();

-- Drop the enum
DROP TYPE IF EXISTS role_enum;

-- Verify clean state
DO $$
BEGIN
  RAISE NOTICE 'Rollback complete – all tables, policies, and enum removed.';
END
$$;

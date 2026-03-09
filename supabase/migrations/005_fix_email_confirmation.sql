-- ============================================
--  FIX: Disable Email Confirmation
--  WARNING: Only for development/testing
--  In production, keep email confirmation enabled
-- ============================================

-- This SQL should be run in Supabase Dashboard SQL Editor
-- to disable email confirmation requirement

-- For existing unconfirmed users, confirm their emails
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;

-- Note: To disable email confirmation for new signups:
-- Go to Supabase Dashboard > Authentication > Email Providers
-- Toggle OFF "Enable email confirmations"

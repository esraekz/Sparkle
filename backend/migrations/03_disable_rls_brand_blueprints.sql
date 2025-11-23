-- ============================================================
-- Disable RLS for Phase 1 Mock Auth
-- ============================================================
-- Row Level Security policies don't work with Phase 1 mock auth
-- because we don't have auth.uid() available yet
-- We'll re-enable RLS in Phase 2 when we switch to real Supabase Auth

-- Disable RLS on brand_blueprints table
ALTER TABLE public.sparkle_brand_blueprints DISABLE ROW LEVEL SECURITY;

-- Drop any existing RLS policies (if they weren't dropped during migration)
DROP POLICY IF EXISTS user_own_blueprint ON public.sparkle_brand_blueprints;
DROP POLICY IF EXISTS brand_blueprints_policy ON public.sparkle_brand_blueprints;

-- Verify RLS is disabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'sparkle_brand_blueprints';

-- Expected output: rowsecurity = false

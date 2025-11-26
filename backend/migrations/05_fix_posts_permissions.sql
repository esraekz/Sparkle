-- ============================================================
-- Fix sparkle_posts table permissions for Phase 1 Mock Auth
-- ============================================================
-- The posts table needs RLS disabled and permissions granted
-- just like brand_blueprints for Phase 1 mock authentication

-- 1. Disable RLS on sparkle_posts table
ALTER TABLE public.sparkle_posts DISABLE ROW LEVEL SECURITY;

-- 2. Drop any existing RLS policies
DROP POLICY IF EXISTS posts_policy ON public.sparkle_posts;
DROP POLICY IF EXISTS user_own_posts ON public.sparkle_posts;

-- 3. Grant all permissions to service_role, authenticated, and anon
GRANT ALL ON public.sparkle_posts TO service_role;
GRANT ALL ON public.sparkle_posts TO authenticated;
GRANT ALL ON public.sparkle_posts TO anon;

-- 4. Verify RLS is disabled
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'sparkle_posts';

-- Expected output: rls_enabled = false

-- 5. Verify permissions
SELECT
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'sparkle_posts'
ORDER BY grantee, privilege_type;

-- ============================================================
-- Diagnostic Query: Check table permissions and RLS status
-- ============================================================
-- Run this to see what's blocking access to the table

-- 1. Check if table exists and in which schema
SELECT
    schemaname,
    tablename,
    tableowner,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'sparkle_brand_blueprints';

-- 2. Check all policies on the table
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'sparkle_brand_blueprints';

-- 3. Check table privileges for service_role
SELECT
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'sparkle_brand_blueprints'
ORDER BY grantee, privilege_type;

-- 4. Grant all permissions to service_role and authenticated roles
-- (Run this if the table lacks proper grants)
GRANT ALL ON public.sparkle_brand_blueprints TO service_role;
GRANT ALL ON public.sparkle_brand_blueprints TO authenticated;
GRANT ALL ON public.sparkle_brand_blueprints TO anon;

-- 5. Disable RLS again (in case it was re-enabled)
ALTER TABLE public.sparkle_brand_blueprints DISABLE ROW LEVEL SECURITY;

-- 6. Verify RLS is now disabled
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'sparkle_brand_blueprints';

-- Expected output: rls_enabled = false

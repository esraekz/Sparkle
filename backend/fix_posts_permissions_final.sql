-- ============================================================
-- FIX PERMISSIONS FOR SPARKLE_POSTS TABLE
-- Run this in Supabase SQL Editor to fix the 403 Forbidden error
-- ============================================================

-- Step 1: Check which schema the table is actually in
SELECT
    schemaname,
    tablename,
    tableowner,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'sparkle_posts';

-- Step 2: Grant permissions on BOTH sparkle and public schemas (just in case)
GRANT USAGE ON SCHEMA sparkle TO service_role, anon, authenticated;
GRANT USAGE ON SCHEMA public TO service_role, anon, authenticated;

-- Step 3: Grant ALL privileges on the sparkle_posts table (in sparkle schema if it exists)
GRANT ALL ON TABLE sparkle.sparkle_posts TO service_role, anon, authenticated;

-- Step 4: Grant ALL privileges on the sparkle_posts table (in public schema if it exists)
GRANT ALL ON TABLE public.sparkle_posts TO service_role, anon, authenticated;

-- Step 5: Disable RLS completely for development
ALTER TABLE IF EXISTS sparkle.sparkle_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sparkle_posts DISABLE ROW LEVEL SECURITY;

-- Step 6: Grant permissions on sequences (for auto-increment IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA sparkle TO service_role, anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role, anon, authenticated;

-- Step 7: Verify permissions are set
SELECT
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'sparkle_posts'
ORDER BY grantee, table_schema, privilege_type;

-- Step 8: Test insert (modify user_id to match your mock user)
-- Uncomment to test:
-- INSERT INTO sparkle_posts (user_id, content, hashtags, source_type, status)
-- VALUES (
--     '123e4567-e89b-12d3-a456-426614174000',
--     'Test post from SQL',
--     ARRAY['test'],
--     'manual',
--     'draft'
-- )
-- RETURNING *;

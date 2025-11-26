-- DIAGNOSTIC SQL TO FIND THE SCHEMA ISSUE
-- Run this in Supabase SQL Editor

-- 1. Check which schema sparkle_posts is actually in
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE tablename = 'sparkle_posts';

-- 2. Check if sparkle schema exists
SELECT schema_name
FROM information_schema.schemata
WHERE schema_name = 'sparkle';

-- 3. Check current database search_path
SHOW search_path;

-- 4. Check table permissions
SELECT
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'sparkle_posts'
ORDER BY table_schema, grantee, privilege_type;

-- 5. Try to select from the table directly (this will show the actual error)
SELECT * FROM sparkle_posts LIMIT 1;

-- 6. Try with explicit public schema
SELECT * FROM public.sparkle_posts LIMIT 1;

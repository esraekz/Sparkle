-- Verify sparkle_posts table exists and check its schema
SELECT
    schemaname,
    tablename,
    tableowner,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'sparkle_posts';

-- Check table permissions
SELECT
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'sparkle_posts'
ORDER BY grantee, privilege_type;

-- Test insert (this will show the actual error if any)
-- Make sure to replace 'your-user-id' with an actual UUID
-- INSERT INTO sparkle_posts (user_id, content, hashtags, source_type)
-- VALUES ('123e4567-e89b-12d3-a456-426614174000', 'Test post', ARRAY['test'], 'manual');

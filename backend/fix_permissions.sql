-- Fix permissions for sparkle_posts table
-- Run this in Supabase SQL Editor

-- Grant usage on schema
GRANT USAGE ON SCHEMA sparkle TO service_role;
GRANT USAGE ON SCHEMA sparkle TO anon;
GRANT USAGE ON SCHEMA sparkle TO authenticated;

-- Grant all privileges on sparkle_posts table
GRANT ALL ON sparkle.sparkle_posts TO service_role;
GRANT ALL ON sparkle.sparkle_posts TO anon;
GRANT ALL ON sparkle.sparkle_posts TO authenticated;

-- Grant usage on sequences (for auto-incrementing IDs if any)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA sparkle TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA sparkle TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA sparkle TO authenticated;

-- Temporarily disable RLS for development (OPTIONAL - only if you want to test quickly)
-- WARNING: In production, you should configure proper RLS policies instead!
ALTER TABLE sparkle.sparkle_posts DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS and create policies (RECOMMENDED for production)
-- Uncomment the following lines when you're ready for proper security:

-- ALTER TABLE sparkle.sparkle_posts ENABLE ROW LEVEL SECURITY;

-- -- Policy: Users can only see their own posts
-- CREATE POLICY "Users can view own posts" ON sparkle.sparkle_posts
--     FOR SELECT
--     USING (auth.uid() = user_id);

-- -- Policy: Users can insert their own posts
-- CREATE POLICY "Users can insert own posts" ON sparkle.sparkle_posts
--     FOR INSERT
--     WITH CHECK (auth.uid() = user_id);

-- -- Policy: Users can update their own posts
-- CREATE POLICY "Users can update own posts" ON sparkle.sparkle_posts
--     FOR UPDATE
--     USING (auth.uid() = user_id);

-- -- Policy: Users can delete their own posts
-- CREATE POLICY "Users can delete own posts" ON sparkle.sparkle_posts
--     FOR DELETE
--     USING (auth.uid() = user_id);

-- Verify permissions
SELECT
    schemaname,
    tablename,
    tableowner,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'sparkle';

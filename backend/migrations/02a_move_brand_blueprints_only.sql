-- ============================================================
-- Quick Migration: Move sparkle_brand_blueprints to public schema
-- ============================================================
-- This is a simplified version that only moves the brand_blueprints table
-- Run this first to test if onboarding works, then move other tables later

-- Step 1: Check current location of the table
SELECT schemaname, tablename
FROM pg_tables
WHERE tablename = 'sparkle_brand_blueprints';

-- Step 2: Disable RLS on the table
ALTER TABLE sparkle.sparkle_brand_blueprints DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop any policies that might block the migration
DROP POLICY IF EXISTS user_own_blueprint ON sparkle.sparkle_brand_blueprints;
DROP POLICY IF EXISTS brand_blueprints_policy ON sparkle.sparkle_brand_blueprints;

-- Step 4: Drop the foreign key constraint to users (we'll skip recreating it for Phase 1)
ALTER TABLE sparkle.sparkle_brand_blueprints
    DROP CONSTRAINT IF EXISTS sparkle_brand_blueprints_user_id_fkey;

-- Step 5: Move the table to public schema
ALTER TABLE sparkle.sparkle_brand_blueprints SET SCHEMA public;

-- Step 6: Verify the table is now in public schema
SELECT schemaname, tablename
FROM pg_tables
WHERE tablename = 'sparkle_brand_blueprints';

-- Expected output: schemaname = 'public', tablename = 'sparkle_brand_blueprints'

-- ============================================================
-- Post-Migration Notes
-- ============================================================
-- After running this:
-- 1. The table is now at: public.sparkle_brand_blueprints
-- 2. Your backend can access it via: supabase.table("sparkle_brand_blueprints")
-- 3. Onboarding should work!
-- 4. You can move the other tables later using the full migration file

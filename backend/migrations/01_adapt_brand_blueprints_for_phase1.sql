-- ============================================================
-- Migration: Adapt brand_blueprints table for Phase 1 MVP
-- ============================================================
-- This migration modifies the existing brand_blueprints table to:
-- 1. Work with Phase 1 mock authentication (TEXT user_id instead of UUID foreign key)
-- 2. Add onboarding-specific fields (topics, main_goal, inspirations, posting_preferences)
-- 3. Make most fields optional to support gradual onboarding flow
-- 4. Keep all rich fields for Phase 2 AI features

-- Step 1: Drop the foreign key constraint temporarily for Phase 1
-- (We'll add it back in Phase 2 when we have real user authentication)
ALTER TABLE brand_blueprints DROP CONSTRAINT IF EXISTS brand_blueprints_user_id_fkey;

-- Step 2: Change user_id from UUID to TEXT to support Phase 1 mock auth
-- (UUID5 generated from email in mock auth is stored as TEXT)
ALTER TABLE brand_blueprints ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Step 3: Add onboarding-specific fields
ALTER TABLE brand_blueprints ADD COLUMN IF NOT EXISTS topics TEXT[]; -- Expertise areas (e.g., ['AI', 'Marketing'])
ALTER TABLE brand_blueprints ADD COLUMN IF NOT EXISTS main_goal TEXT; -- User's primary goal
ALTER TABLE brand_blueprints ADD COLUMN IF NOT EXISTS inspirations TEXT[]; -- People/brands to learn from
ALTER TABLE brand_blueprints ADD COLUMN IF NOT EXISTS posting_preferences JSONB DEFAULT '{}'; -- Posting schedule preferences

-- Step 4: Make name and description optional (not needed in initial onboarding)
ALTER TABLE brand_blueprints ALTER COLUMN name DROP NOT NULL;
ALTER TABLE brand_blueprints ALTER COLUMN description DROP NOT NULL;

-- Step 5: Set default values for name if not provided
ALTER TABLE brand_blueprints ALTER COLUMN name SET DEFAULT 'My Brand Voice';

-- Step 6: Make tone a single TEXT field instead of array (simpler for Phase 1)
-- Store single tone selection: 'Professional', 'Casual', 'Thought Leader', 'Storyteller'
ALTER TABLE brand_blueprints DROP COLUMN IF EXISTS tone CASCADE;
ALTER TABLE brand_blueprints ADD COLUMN tone TEXT; -- Single tone selection

-- Step 7: Disable Row Level Security for Phase 1 (no auth.uid() available)
-- We'll enable it in Phase 2 when Supabase Auth is implemented
ALTER TABLE brand_blueprints DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS brand_blueprints_policy ON brand_blueprints;

-- Step 8: Update indexes for TEXT user_id
DROP INDEX IF EXISTS idx_brand_blueprints_user_id;
CREATE INDEX idx_brand_blueprints_user_id ON brand_blueprints(user_id);

-- Step 9: Add unique constraint for one blueprint per user
DROP INDEX IF EXISTS idx_brand_blueprints_user_default;
CREATE UNIQUE INDEX idx_brand_blueprints_one_per_user ON brand_blueprints(user_id) WHERE is_default = TRUE;

-- ============================================================
-- Comments for documentation
-- ============================================================
COMMENT ON COLUMN brand_blueprints.topics IS 'Phase 1: User expertise areas from onboarding';
COMMENT ON COLUMN brand_blueprints.main_goal IS 'Phase 1: User primary goal from onboarding';
COMMENT ON COLUMN brand_blueprints.inspirations IS 'Phase 1: People/brands user wants to learn from';
COMMENT ON COLUMN brand_blueprints.posting_preferences IS 'Phase 1: Posting schedule (preferred_days, preferred_hours, posts_per_week, ask_before_publish)';
COMMENT ON COLUMN brand_blueprints.tone IS 'Phase 1: Single tone selection (Professional, Casual, Thought Leader, Storyteller)';
COMMENT ON COLUMN brand_blueprints.user_id IS 'Phase 1: TEXT (UUID5 from email). Phase 2: Will be UUID with FK to users table';

-- ============================================================
-- Verification
-- ============================================================
-- Check the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'brand_blueprints'
ORDER BY ordinal_position;

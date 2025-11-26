-- ============================================================
-- ADD STATUS COLUMN TO SPARKLE_POSTS TABLE
-- Migration 06: Add status column and other missing fields
-- ============================================================

-- First, let's check what columns currently exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'sparkle_posts'
ORDER BY ordinal_position;

-- Add status column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'sparkle_posts'
        AND column_name = 'status'
    ) THEN
        ALTER TABLE sparkle_posts
        ADD COLUMN status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'scheduled', 'published'));

        RAISE NOTICE 'Added status column to sparkle_posts';
    ELSE
        RAISE NOTICE 'status column already exists';
    END IF;
END $$;

-- Add source_type column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'sparkle_posts'
        AND column_name = 'source_type'
    ) THEN
        ALTER TABLE sparkle_posts
        ADD COLUMN source_type TEXT NOT NULL DEFAULT 'manual'
        CHECK (source_type IN ('ai_generated', 'manual', 'trending_news'));

        RAISE NOTICE 'Added source_type column to sparkle_posts';
    ELSE
        RAISE NOTICE 'source_type column already exists';
    END IF;
END $$;

-- Add source_article_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'sparkle_posts'
        AND column_name = 'source_article_id'
    ) THEN
        ALTER TABLE sparkle_posts
        ADD COLUMN source_article_id UUID NULL;

        RAISE NOTICE 'Added source_article_id column to sparkle_posts';
    ELSE
        RAISE NOTICE 'source_article_id column already exists';
    END IF;
END $$;

-- Add scheduled_for column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'sparkle_posts'
        AND column_name = 'scheduled_for'
    ) THEN
        ALTER TABLE sparkle_posts
        ADD COLUMN scheduled_for TIMESTAMPTZ NULL;

        RAISE NOTICE 'Added scheduled_for column to sparkle_posts';
    ELSE
        RAISE NOTICE 'scheduled_for column already exists';
    END IF;
END $$;

-- Add published_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'sparkle_posts'
        AND column_name = 'published_at'
    ) THEN
        ALTER TABLE sparkle_posts
        ADD COLUMN published_at TIMESTAMPTZ NULL;

        RAISE NOTICE 'Added published_at column to sparkle_posts';
    ELSE
        RAISE NOTICE 'published_at column already exists';
    END IF;
END $$;

-- Add engagement_metrics column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'sparkle_posts'
        AND column_name = 'engagement_metrics'
    ) THEN
        ALTER TABLE sparkle_posts
        ADD COLUMN engagement_metrics JSONB NULL;

        RAISE NOTICE 'Added engagement_metrics column to sparkle_posts';
    ELSE
        RAISE NOTICE 'engagement_metrics column already exists';
    END IF;
END $$;

-- Verify the final table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'sparkle_posts'
ORDER BY ordinal_position;

-- Reload the schema cache (this is important for PostgREST/Supabase)
NOTIFY pgrst, 'reload schema';

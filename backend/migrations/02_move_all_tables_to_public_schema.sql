-- ============================================================
-- Migration: Move all tables from sparkle schema to public schema
-- ============================================================
-- This migration moves all tables from the 'sparkle' schema to the 'public' schema
-- to make them accessible via Supabase REST API (PostgREST)
--
-- Tables to move:
-- - sparkle_brand_blueprints
-- - sparkle_creators_to_follow
-- - sparkle_news_articles
-- - sparkle_notification_tokens
-- - sparkle_post_embeddings
-- - sparkle_posts
-- - sparkle_trending_posts
-- - sparkle_user_analytics
-- - sparkle_users

-- Step 1: Disable Row Level Security on all tables
-- (RLS policies can block schema changes)
ALTER TABLE sparkle.sparkle_brand_blueprints DISABLE ROW LEVEL SECURITY;
ALTER TABLE sparkle.sparkle_creators_to_follow DISABLE ROW LEVEL SECURITY;
ALTER TABLE sparkle.sparkle_news_articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE sparkle.sparkle_notification_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE sparkle.sparkle_post_embeddings DISABLE ROW LEVEL SECURITY;
ALTER TABLE sparkle.sparkle_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE sparkle.sparkle_trending_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE sparkle.sparkle_user_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE sparkle.sparkle_users DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all RLS policies (if they exist)
DROP POLICY IF EXISTS user_own_blueprint ON sparkle.sparkle_brand_blueprints;
DROP POLICY IF EXISTS brand_blueprints_policy ON sparkle.sparkle_brand_blueprints;
DROP POLICY IF EXISTS users_policy ON sparkle.sparkle_users;
DROP POLICY IF EXISTS posts_policy ON sparkle.sparkle_posts;
DROP POLICY IF EXISTS post_embeddings_policy ON sparkle.sparkle_post_embeddings;
DROP POLICY IF EXISTS creators_policy ON sparkle.sparkle_creators_to_follow;
DROP POLICY IF EXISTS news_policy ON sparkle.sparkle_news_articles;
DROP POLICY IF EXISTS notifications_policy ON sparkle.sparkle_notification_tokens;
DROP POLICY IF EXISTS trending_policy ON sparkle.sparkle_trending_posts;
DROP POLICY IF EXISTS analytics_policy ON sparkle.sparkle_user_analytics;

-- Step 3: Drop foreign key constraints that reference tables in sparkle schema
-- (We'll recreate them after moving all tables)

-- Note: Foreign keys on sparkle_brand_blueprints
ALTER TABLE sparkle.sparkle_brand_blueprints
    DROP CONSTRAINT IF EXISTS sparkle_brand_blueprints_user_id_fkey;

-- Note: Foreign keys on sparkle_posts (likely references user and blueprint)
ALTER TABLE sparkle.sparkle_posts
    DROP CONSTRAINT IF EXISTS sparkle_posts_user_id_fkey;
ALTER TABLE sparkle.sparkle_posts
    DROP CONSTRAINT IF EXISTS sparkle_posts_brand_blueprint_id_fkey;
ALTER TABLE sparkle.sparkle_posts
    DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
ALTER TABLE sparkle.sparkle_posts
    DROP CONSTRAINT IF EXISTS posts_brand_blueprint_id_fkey;

-- Note: Foreign keys on sparkle_post_embeddings (likely references posts)
ALTER TABLE sparkle.sparkle_post_embeddings
    DROP CONSTRAINT IF EXISTS sparkle_post_embeddings_post_id_fkey;
ALTER TABLE sparkle.sparkle_post_embeddings
    DROP CONSTRAINT IF EXISTS post_embeddings_post_id_fkey;

-- Note: Foreign keys on sparkle_creators_to_follow (likely references user)
ALTER TABLE sparkle.sparkle_creators_to_follow
    DROP CONSTRAINT IF EXISTS sparkle_creators_to_follow_user_id_fkey;
ALTER TABLE sparkle.sparkle_creators_to_follow
    DROP CONSTRAINT IF EXISTS creators_to_follow_user_id_fkey;

-- Note: Foreign keys on sparkle_news_articles (might reference user)
ALTER TABLE sparkle.sparkle_news_articles
    DROP CONSTRAINT IF EXISTS sparkle_news_articles_user_id_fkey;
ALTER TABLE sparkle.sparkle_news_articles
    DROP CONSTRAINT IF EXISTS news_articles_user_id_fkey;

-- Note: Foreign keys on sparkle_notification_tokens (likely references user)
ALTER TABLE sparkle.sparkle_notification_tokens
    DROP CONSTRAINT IF EXISTS sparkle_notification_tokens_user_id_fkey;
ALTER TABLE sparkle.sparkle_notification_tokens
    DROP CONSTRAINT IF EXISTS notification_tokens_user_id_fkey;

-- Note: Foreign keys on sparkle_trending_posts (might reference post or user)
ALTER TABLE sparkle.sparkle_trending_posts
    DROP CONSTRAINT IF EXISTS sparkle_trending_posts_post_id_fkey;
ALTER TABLE sparkle.sparkle_trending_posts
    DROP CONSTRAINT IF EXISTS sparkle_trending_posts_user_id_fkey;
ALTER TABLE sparkle.sparkle_trending_posts
    DROP CONSTRAINT IF EXISTS trending_posts_post_id_fkey;

-- Note: Foreign keys on sparkle_user_analytics (likely references user)
ALTER TABLE sparkle.sparkle_user_analytics
    DROP CONSTRAINT IF EXISTS sparkle_user_analytics_user_id_fkey;
ALTER TABLE sparkle.sparkle_user_analytics
    DROP CONSTRAINT IF EXISTS user_analytics_user_id_fkey;

-- Step 4: Move all tables to public schema
-- IMPORTANT: Move sparkle_users FIRST since other tables reference it
ALTER TABLE sparkle.sparkle_users SET SCHEMA public;
ALTER TABLE sparkle.sparkle_brand_blueprints SET SCHEMA public;
ALTER TABLE sparkle.sparkle_posts SET SCHEMA public;
ALTER TABLE sparkle.sparkle_post_embeddings SET SCHEMA public;
ALTER TABLE sparkle.sparkle_creators_to_follow SET SCHEMA public;
ALTER TABLE sparkle.sparkle_news_articles SET SCHEMA public;
ALTER TABLE sparkle.sparkle_notification_tokens SET SCHEMA public;
ALTER TABLE sparkle.sparkle_trending_posts SET SCHEMA public;
ALTER TABLE sparkle.sparkle_user_analytics SET SCHEMA public;

-- Step 5: Recreate foreign key constraints (now in public schema)
-- Note: Only add constraints if the columns exist and match
-- You may need to adjust these based on your actual table structure

-- brand_blueprints references users (but only if user_id is UUID, not TEXT for Phase 1)
-- ALTER TABLE public.sparkle_brand_blueprints
--     ADD CONSTRAINT sparkle_brand_blueprints_user_id_fkey
--     FOREIGN KEY (user_id) REFERENCES public.sparkle_users(id) ON DELETE CASCADE;

-- posts references users and brand_blueprints
-- ALTER TABLE public.sparkle_posts
--     ADD CONSTRAINT sparkle_posts_user_id_fkey
--     FOREIGN KEY (user_id) REFERENCES public.sparkle_users(id) ON DELETE CASCADE;
-- ALTER TABLE public.sparkle_posts
--     ADD CONSTRAINT sparkle_posts_brand_blueprint_id_fkey
--     FOREIGN KEY (brand_blueprint_id) REFERENCES public.sparkle_brand_blueprints(id) ON DELETE SET NULL;

-- post_embeddings references posts
-- ALTER TABLE public.sparkle_post_embeddings
--     ADD CONSTRAINT sparkle_post_embeddings_post_id_fkey
--     FOREIGN KEY (post_id) REFERENCES public.sparkle_posts(id) ON DELETE CASCADE;

-- creators_to_follow references users
-- ALTER TABLE public.sparkle_creators_to_follow
--     ADD CONSTRAINT sparkle_creators_to_follow_user_id_fkey
--     FOREIGN KEY (user_id) REFERENCES public.sparkle_users(id) ON DELETE CASCADE;

-- news_articles references users (if applicable)
-- ALTER TABLE public.sparkle_news_articles
--     ADD CONSTRAINT sparkle_news_articles_user_id_fkey
--     FOREIGN KEY (user_id) REFERENCES public.sparkle_users(id) ON DELETE CASCADE;

-- notification_tokens references users
-- ALTER TABLE public.sparkle_notification_tokens
--     ADD CONSTRAINT sparkle_notification_tokens_user_id_fkey
--     FOREIGN KEY (user_id) REFERENCES public.sparkle_users(id) ON DELETE CASCADE;

-- trending_posts references posts (if applicable)
-- ALTER TABLE public.sparkle_trending_posts
--     ADD CONSTRAINT sparkle_trending_posts_post_id_fkey
--     FOREIGN KEY (post_id) REFERENCES public.sparkle_posts(id) ON DELETE CASCADE;

-- user_analytics references users
-- ALTER TABLE public.sparkle_user_analytics
--     ADD CONSTRAINT sparkle_user_analytics_user_id_fkey
--     FOREIGN KEY (user_id) REFERENCES public.sparkle_users(id) ON DELETE CASCADE;

-- Step 6: Verification - Check all tables are now in public schema
SELECT
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_name IN (
    'sparkle_users',
    'sparkle_brand_blueprints',
    'sparkle_posts',
    'sparkle_post_embeddings',
    'sparkle_creators_to_follow',
    'sparkle_news_articles',
    'sparkle_notification_tokens',
    'sparkle_trending_posts',
    'sparkle_user_analytics'
)
ORDER BY table_name;

-- ============================================================
-- Post-Migration Notes
-- ============================================================
-- 1. All tables are now in the public schema and accessible via Supabase REST API
-- 2. Foreign key constraints are commented out - uncomment and adjust as needed
-- 3. For Phase 1: sparkle_brand_blueprints.user_id is TEXT (not UUID)
--    so we cannot add foreign key to sparkle_users(id) which is UUID
-- 4. Row Level Security is disabled - you can re-enable it later when you
--    switch to real Supabase Auth in Phase 2
-- 5. The sparkle schema is now empty and can be dropped if not needed:
--    DROP SCHEMA IF EXISTS sparkle CASCADE;

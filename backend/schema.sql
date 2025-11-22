-- Sparkle App Database Schema
-- This schema defines tables for a social media content creation app with AI-powered brand voice

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
-- Stores user authentication and profile information
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    -- Settings and preferences
    preferences JSONB DEFAULT '{}',
    -- Metadata
    metadata JSONB DEFAULT '{}'
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- ============================================================
-- 2. BRAND_BLUEPRINTS TABLE
-- ============================================================
-- Stores brand voice definitions, tone, style guidelines, and examples
CREATE TABLE IF NOT EXISTS brand_blueprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,

    -- Brand Voice Configuration
    tone TEXT[], -- e.g., ['professional', 'friendly', 'casual']
    voice_characteristics JSONB DEFAULT '{}', -- Detailed voice attributes

    -- Style Guidelines
    writing_style TEXT, -- e.g., 'conversational', 'formal', 'technical'
    vocabulary_level TEXT CHECK (vocabulary_level IN ('simple', 'intermediate', 'advanced', 'expert')),
    sentence_structure TEXT, -- e.g., 'short and punchy', 'varied', 'complex'

    -- Content Preferences
    emoji_usage TEXT CHECK (emoji_usage IN ('none', 'minimal', 'moderate', 'frequent')),
    hashtag_strategy TEXT CHECK (hashtag_strategy IN ('none', 'minimal', 'targeted', 'extensive')),
    call_to_action_style TEXT,

    -- Example Posts (for AI training)
    example_posts TEXT[], -- Array of example posts in this brand voice

    -- Target Audience
    target_audience JSONB DEFAULT '{}', -- Demographics, interests, etc.

    -- Platform-Specific Settings
    platform_settings JSONB DEFAULT '{}', -- Different settings for Twitter, LinkedIn, etc.

    -- AI Configuration
    ai_model_preferences JSONB DEFAULT '{}',
    temperature DECIMAL(3, 2) DEFAULT 0.7, -- AI creativity level

    -- Status and Metadata
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE, -- User's default blueprint
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_brand_blueprints_user_id ON brand_blueprints(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_blueprints_created_at ON brand_blueprints(created_at);
CREATE INDEX IF NOT EXISTS idx_brand_blueprints_is_active ON brand_blueprints(is_active);

-- Ensure only one default blueprint per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_brand_blueprints_user_default
    ON brand_blueprints(user_id)
    WHERE is_default = TRUE;

-- ============================================================
-- 3. POSTS TABLE
-- ============================================================
-- Stores generated and published social media posts
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brand_blueprint_id UUID REFERENCES brand_blueprints(id) ON DELETE SET NULL,

    -- Post Content
    content TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'instagram', 'facebook', 'threads', 'multi')),

    -- Post Metadata
    title TEXT, -- For platforms like LinkedIn
    media_urls TEXT[], -- Images, videos, etc.
    hashtags TEXT[],
    mentions TEXT[],

    -- Generation Details
    prompt TEXT, -- Original user prompt/input
    generation_method TEXT CHECK (generation_method IN ('ai_generated', 'user_written', 'ai_assisted')),
    ai_model_used TEXT, -- e.g., 'gpt-4', 'claude-3'

    -- Scheduling and Publishing
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed', 'archived')),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,

    -- Engagement Metrics (for published posts)
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    impressions_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5, 2),

    -- External References
    external_post_id TEXT, -- ID from the social media platform
    external_url TEXT, -- URL to the published post

    -- Versioning
    version INTEGER DEFAULT 1,
    parent_post_id UUID REFERENCES posts(id) ON DELETE SET NULL, -- For tracking iterations

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Additional Data
    metadata JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_brand_blueprint_id ON posts(brand_blueprint_id);
CREATE INDEX IF NOT EXISTS idx_posts_platform ON posts(platform);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_for ON posts(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_parent_post_id ON posts(parent_post_id);

-- ============================================================
-- 4. POST_EMBEDDINGS TABLE
-- ============================================================
-- Stores vector embeddings for semantic search and similarity matching
CREATE TABLE IF NOT EXISTS post_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,

    -- Embedding Vector (using pgvector extension)
    -- Note: You'll need to enable the pgvector extension in Supabase
    embedding vector(1536), -- OpenAI ada-002 produces 1536-dimensional vectors

    -- Embedding Metadata
    embedding_model TEXT NOT NULL, -- e.g., 'text-embedding-ada-002'
    embedding_type TEXT CHECK (embedding_type IN ('content', 'style', 'semantic')),

    -- For content chunks (if post is split)
    chunk_index INTEGER DEFAULT 0,
    total_chunks INTEGER DEFAULT 1,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Metadata
    metadata JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_post_embeddings_post_id ON post_embeddings(post_id);
CREATE INDEX IF NOT EXISTS idx_post_embeddings_created_at ON post_embeddings(created_at);

-- Vector similarity index (using HNSW algorithm for fast similarity search)
-- Uncomment after enabling pgvector extension:
-- CREATE INDEX IF NOT EXISTS idx_post_embeddings_vector ON post_embeddings
--     USING hnsw (embedding vector_cosine_ops);

-- ============================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================
-- Automatically update the updated_at timestamp

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_blueprints_updated_at BEFORE UPDATE ON brand_blueprints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_embeddings_updated_at BEFORE UPDATE ON post_embeddings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
-- Enable RLS for all tables

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_embeddings ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own data
CREATE POLICY users_policy ON users
    FOR ALL
    USING (auth.uid() = id);

CREATE POLICY brand_blueprints_policy ON brand_blueprints
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY posts_policy ON posts
    FOR ALL
    USING (auth.uid() = user_id);

-- Post embeddings inherit permissions from posts
CREATE POLICY post_embeddings_policy ON post_embeddings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM posts
            WHERE posts.id = post_embeddings.post_id
            AND posts.user_id = auth.uid()
        )
    );

-- ============================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================

COMMENT ON TABLE users IS 'User authentication and profile information';
COMMENT ON TABLE brand_blueprints IS 'Brand voice definitions and style guidelines';
COMMENT ON TABLE posts IS 'Social media posts (drafts, scheduled, and published)';
COMMENT ON TABLE post_embeddings IS 'Vector embeddings for semantic search and content similarity';

COMMENT ON COLUMN brand_blueprints.temperature IS 'AI creativity level (0.0-1.0)';
COMMENT ON COLUMN posts.engagement_rate IS 'Calculated engagement rate as percentage';
COMMENT ON COLUMN post_embeddings.embedding IS 'Vector embedding for semantic search (requires pgvector extension)';

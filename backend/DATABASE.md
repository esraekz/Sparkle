# Sparkle Database Schema Documentation

## Overview

Sparkle uses Supabase (PostgreSQL) as its database with the following core tables:

1. **users** - User accounts and profiles
2. **brand_blueprints** - Brand voice and style definitions
3. **posts** - Social media content
4. **post_embeddings** - Vector embeddings for AI-powered search

## Current Database Status

Run this command to see existing tables:
```bash
cd backend
source venv/bin/activate
python list_tables.py
```

## Database Schema

### 1. Users Table

Stores user authentication and profile information.

**Key Fields:**
- `id` (UUID) - Primary key
- `email` (TEXT) - Unique email address
- `username` (TEXT) - Unique username
- `subscription_tier` - free, pro, or enterprise
- `preferences` (JSONB) - User settings and preferences

### 2. Brand Blueprints Table

Defines brand voice, tone, and style guidelines for content generation.

**Key Fields:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `name` (TEXT) - Blueprint name
- `tone` (TEXT[]) - Array of tone descriptors
- `voice_characteristics` (JSONB) - Detailed voice attributes
- `example_posts` (TEXT[]) - Sample posts for AI training
- `temperature` (DECIMAL) - AI creativity level (0.0-1.0)

**Features:**
- Multiple blueprints per user
- One default blueprint per user
- Platform-specific settings
- Target audience configuration

### 3. Posts Table

Stores all social media posts (drafts, scheduled, and published).

**Key Fields:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `brand_blueprint_id` (UUID) - Foreign key to brand_blueprints
- `content` (TEXT) - Post content
- `platform` - twitter, linkedin, instagram, facebook, threads, multi
- `status` - draft, scheduled, published, failed, archived
- `engagement_rate` (DECIMAL) - Calculated engagement percentage

**Features:**
- Multi-platform support
- Post scheduling
- Engagement tracking
- Version control (parent_post_id)
- Media attachments

### 4. Post Embeddings Table

Stores vector embeddings for semantic search and content similarity.

**Key Fields:**
- `id` (UUID) - Primary key
- `post_id` (UUID) - Foreign key to posts
- `embedding` (VECTOR) - 1536-dimensional vector
- `embedding_model` (TEXT) - Model used (e.g., text-embedding-ada-002)

**Requirements:**
- Requires `pgvector` extension in Supabase
- Uses HNSW index for fast similarity search

## Setup Instructions

### 1. Enable Required Extensions

In Supabase Dashboard → Database → Extensions:
- Enable **pgvector** extension

### 2. Run Migration

**Option A: Supabase Dashboard (Recommended)**
1. Go to https://app.supabase.com
2. Select your project
3. Navigate to SQL Editor
4. Copy contents of `schema.sql`
5. Paste and run in SQL Editor

**Option B: Supabase CLI**
```bash
# Initialize Supabase locally
supabase init

# Create migration
supabase migration new initial_schema

# Copy schema.sql to the migration file
# Then push to remote
supabase db push
```

### 3. Verify Tables

```bash
python list_tables.py
```

Expected output:
- users
- brand_blueprints
- posts
- post_embeddings

## Security

### Row Level Security (RLS)

All tables have RLS enabled with these policies:

- **users**: Users can only access their own data
- **brand_blueprints**: Users can only access their own blueprints
- **posts**: Users can only access their own posts
- **post_embeddings**: Inherits permissions from posts table

### Authentication

Uses Supabase Auth with the following flow:
1. User signs up/logs in via Supabase Auth
2. `auth.uid()` returns the authenticated user's ID
3. RLS policies enforce data access restrictions

## Relationships

```
users (1) ─────< (many) brand_blueprints
users (1) ─────< (many) posts
brand_blueprints (1) ─────< (many) posts
posts (1) ─────< (many) post_embeddings
posts (1) ─────< (many) posts (parent_post_id for versions)
```

## Key Features

### Automatic Timestamps
All tables have `created_at` and `updated_at` fields that update automatically.

### Soft Deletes
- `users.is_active` - Mark users as inactive instead of deleting
- `posts.status = 'archived'` - Archive posts instead of deleting

### Indexes
Optimized indexes on:
- User lookups (email, username)
- Post queries (user_id, platform, status, dates)
- Brand blueprint lookups (user_id, is_active)
- Vector similarity search (HNSW index)

## Vector Search

### Using Post Embeddings

```python
from database import supabase

# Search for similar posts
query_embedding = [0.1, 0.2, ...]  # Your query vector

result = supabase.rpc(
    'match_posts',
    {
        'query_embedding': query_embedding,
        'match_threshold': 0.8,
        'match_count': 10
    }
).execute()
```

### Creating the Match Function

Add this function in Supabase SQL Editor:

```sql
CREATE OR REPLACE FUNCTION match_posts(
    query_embedding vector(1536),
    match_threshold float,
    match_count int
)
RETURNS TABLE (
    post_id uuid,
    content text,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.content,
        1 - (pe.embedding <=> query_embedding) as similarity
    FROM post_embeddings pe
    JOIN posts p ON p.id = pe.post_id
    WHERE 1 - (pe.embedding <=> query_embedding) > match_threshold
    ORDER BY pe.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
```

## Sample Queries

### Get User's Brand Blueprints
```sql
SELECT * FROM brand_blueprints
WHERE user_id = auth.uid()
AND is_active = true
ORDER BY created_at DESC;
```

### Get Recent Posts
```sql
SELECT
    p.*,
    b.name as brand_name
FROM posts p
LEFT JOIN brand_blueprints b ON b.id = p.brand_blueprint_id
WHERE p.user_id = auth.uid()
ORDER BY p.created_at DESC
LIMIT 20;
```

### Get Scheduled Posts
```sql
SELECT * FROM posts
WHERE user_id = auth.uid()
AND status = 'scheduled'
AND scheduled_for > NOW()
ORDER BY scheduled_for ASC;
```

## Maintenance

### Backup
Supabase automatically backs up your database. For manual backups:
```bash
supabase db dump -f backup.sql
```

### Reset Database (Development Only)
```bash
supabase db reset
```

## Future Enhancements

Potential additions to the schema:

1. **analytics** table - Detailed engagement analytics
2. **content_calendar** table - Editorial calendar
3. **media_library** table - Uploaded images and videos
4. **team_members** table - Multi-user workspaces
5. **api_connections** table - Social media API credentials
6. **content_templates** table - Reusable content templates

## Support

For issues or questions:
- Check Supabase docs: https://supabase.com/docs
- Review pgvector docs: https://github.com/pgvector/pgvector

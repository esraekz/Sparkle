# Sparkle Database Schema

## Overview

All tables use the **sparkle** schema in PostgreSQL (Supabase).

**Migration**: `/backend/migrations/001_initial_schema.sql`

## Tables (9 Total)

### sparkle_users
User accounts and profiles

**Key Columns**:
- `id` (UUID, PK) - User identifier
- `email` (TEXT, UNIQUE) - Login email
- `full_name`, `avatar_url`, `linkedin_profile_url`
- `created_at`, `updated_at`

**RLS**: User can only see their own data

### sparkle_brand_blueprints
User's onboarding preferences (one per user)

**Key Columns**:
- `user_id` (UUID, FK, UNIQUE) - Links to user
- `topics` (TEXT[]) - Selected interests: ["AI", "Leadership"]
- `goal` (TEXT) - LinkedIn goal
- `tone` (TEXT) - Voice style: "Warm & Authentic"
- `posting_frequency` (TEXT) - "2-3x/week"
- `preferred_days` (TEXT[]) - ["Tue", "Thu"]
- `best_time_to_post` (TIME) - 14:00
- `ask_before_publish` (BOOLEAN) - Default TRUE

**RLS**: User can only see their own blueprint

### sparkle_posts
All user posts (drafts, scheduled, published)

**Key Columns**:
- `user_id` (UUID, FK) - Post owner
- `content` (TEXT) - Post text
- `status` (ENUM) - 'draft', 'scheduled', 'published'
- `source_type` (TEXT) - 'ai_generated', 'manual', 'trending_news'
- `source_article_id` (UUID, FK) - Links to news article if applicable
- `hashtags` (TEXT[])
- `scheduled_for` (TIMESTAMP) - When to publish
- `published_at` (TIMESTAMP) - When published
- `engagement_metrics` (JSONB) - {views, likes, comments, shares}

**RLS**: User can only see their own posts

### sparkle_post_embeddings
Vector embeddings for AI voice learning (RAG)

**Key Columns**:
- `post_id` (UUID, FK, UNIQUE) - One embedding per post
- `user_id` (UUID, FK) - Post owner
- `embedding` (vector(1536)) - OpenAI text-embedding-ada-002

**Note**: Requires pgvector extension. Dimension 1536 for OpenAI (adjust for other models).

**RLS**: User can only see their own embeddings

### sparkle_news_articles
Trending news from RSS feeds and NewsAPI

**Key Columns**:
- `title`, `content`, `url` (UNIQUE)
- `source` (TEXT) - "TechCrunch", "HBR"
- `topics` (TEXT[]) - Categories
- `published_at` (TIMESTAMP)
- `trust_score` (FLOAT 0-1) - Source credibility
- `is_trending` (BOOLEAN)
- `expires_at` (TIMESTAMP) - 30-day retention

**RLS**: Public read for all users

**Retention**: Auto-deleted after 30 days

### sparkle_user_analytics
Daily aggregated metrics per user

**Key Columns**:
- `user_id` (UUID, FK)
- `date` (DATE, UNIQUE per user)
- `total_impressions`, `engagement_rate`, `profile_views`, `new_followers`, `posts_published`

**RLS**: User can only see their own analytics

**Note**: Aggregated daily via background job

### sparkle_trending_posts
Curated trending posts from other creators (Social Tab)

**Key Columns**:
- `creator_name`, `creator_title`, `creator_avatar_url`
- `content` (TEXT) - Post text
- `category` (TEXT) - "Top this week", "Most engaging"
- `engagement_count` (INT)
- `source_url` (TEXT) - LinkedIn URL

**RLS**: Public read for all users

**Note**: Phase 1 = manually curated, Phase 2 = automated

### sparkle_creators_to_follow
Suggested creators for discovery (Social Tab)

**Key Columns**:
- `name`, `title`, `avatar_url`, `specialty`
- `linkedin_url` (TEXT)
- `suggested_reason` (TEXT) - "Shares content about #AI"

**RLS**: Public read for all users

**Note**: Phase 1 = manually curated, Phase 2 = personalized

### sparkle_notification_tokens
Expo push notification tokens

**Key Columns**:
- `user_id` (UUID, FK)
- `expo_push_token` (TEXT, UNIQUE)
- `device_type` (TEXT) - 'ios' or 'android'

**RLS**: User can only see their own tokens

---

## Key Relationships

```
sparkle_users (1) ──< (1) sparkle_brand_blueprints
sparkle_users (1) ──< (*) sparkle_posts
sparkle_posts (1) ──< (1) sparkle_post_embeddings
sparkle_posts (*) >── (1) sparkle_news_articles [optional]
```

---

## Important Rules

### Naming Conventions
- All tables: `sparkle_*` prefix
- Primary keys: `id` (UUID)
- Foreign keys: `{table}_id`
- Timestamps: `created_at`, `updated_at`

### Data Types
- IDs: UUID with `gen_random_uuid()`
- Arrays: TEXT[] for topics, hashtags, days
- JSON: JSONB for flexible data (engagement_metrics)
- Vectors: vector(1536) for embeddings

### Row Level Security (RLS)
- **User tables**: Can only access own data (`auth.uid() = user_id`)
- **Public tables**: All users can read (news, trending, creators)

### Auto-Updates
- `updated_at` triggers on: users, brand_blueprints, posts

### Data Retention
- News articles: 30 days (via `expires_at`)
- User data: Cascade delete on account deletion

---

## Quick Reference

### Run Migration
```bash
# In Supabase SQL Editor:
/backend/migrations/001_initial_schema.sql
```

### Verify
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'sparkle';
```

### Rollback
```sql
DROP SCHEMA sparkle CASCADE;
```

---

## Design Decisions

**Why sparkle schema?** Namespace isolation from Supabase internals

**Why UUID keys?** Better for distributed systems, no enumeration attacks

**Why JSONB for engagement?** Flexible metrics without migrations

**Why separate embeddings table?** Keeps posts table smaller, easier to rebuild vectors

**Why TEXT[] for topics?** Simpler than JOINs, GIN index for fast queries

---

**Status**: Phase 1 MVP Ready  
**Migration Version**: 001
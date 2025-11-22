# Sparkle Development Phases

## Current Phase: **Phase 1 (MVP)**

---

## Phase 1: MVP (Months 1-3)

### Goal
Launch working mobile app where users can:
- Onboard with brand blueprint
- Get AI-generated LinkedIn posts (matching their voice)
- Posts based on trending news in their topics
- Schedule and publish posts
- Track basic analytics

### Core Features

#### 1. Authentication & User Management
- [ ] Supabase Auth integration
- [ ] User signup/login (email + password)
- [ ] JWT token verification in FastAPI
- [ ] User profile CRUD endpoints
- [ ] Row-Level Security (RLS) policies

#### 2. Onboarding Flow
- [ ] Brand blueprint collection (topics, tone, goals, posting preferences)
- [ ] Store in `brand_blueprints` table
- [ ] Mobile screens: Onboarding1, Onboarding2, Onboarding3
- [ ] API: POST /onboarding, GET /brand-blueprint

#### 3. Multi-Agent System
- [ ] **News Agent**: Fetches and processes RSS feeds + NewsAPI
- [ ] **Generation Agent**: Creates LinkedIn posts using LLM
- [ ] **Scheduling Agent**: Manages post queue and timing
- [ ] Agent orchestrator to coordinate agents

#### 4. News Ingestion Pipeline
- [ ] RSS feed parser (feedparser library)
- [ ] NewsAPI/GNews integration (fallback)
- [ ] Topic classification (spaCy NER)
- [ ] Deduplication (URL hash + embedding similarity)
- [ ] Trust scoring (whitelist domains)
- [ ] Store in `news_articles` table with 30-day retention
- [ ] APScheduler job: fetch every 6 hours
- [ ] Daily cleanup job for expired articles

#### 5. RAG System (Hybrid)
- [ ] pgvector setup in Supabase
- [ ] Embeddings table with metadata (type, user_id, topics, engagement_score)
- [ ] Vector search (semantic similarity)
- [ ] Keyword search (PostgreSQL full-text search)
- [ ] Hybrid retrieval combining both
- [ ] Three retrieval modes:
  - Content retrieval (news, trends)
  - Voice retrieval (user's past posts)
  - Template retrieval (high-performing structures)

#### 6. Voice Learning (Embedding-Based)
- [ ] Embed user's past posts
- [ ] Store voice embeddings in pgvector
- [ ] Retrieve user's writing style during generation
- [ ] Learn from user edits (store edit_distance)
- [ ] Update voice profile based on engagement patterns

#### 7. LLM Integration (Gateway Pattern)
- [ ] LLM service abstraction layer
- [ ] Support multiple providers (OpenAI, Anthropic)
- [ ] Provider selection via environment variable
- [ ] Prompt templates for different tasks:
  - Post generation
  - News summarization
  - Voice matching
- [ ] Error handling and retries

#### 8. Post Generation & Management
- [ ] Generate post from trending news
- [ ] Generate evergreen post from topic
- [ ] Generate from user manual input
- [ ] Save drafts to `posts` table
- [ ] Edit post endpoint
- [ ] Schedule post for future publication
- [ ] Publish post (v1: copy to clipboard + deeplink to LinkedIn)
- [ ] Discard/delete post

#### 9. Scheduling System
- [ ] APScheduler integration in FastAPI
- [ ] Schedule post at specific time
- [ ] AI-suggested optimal posting times
- [ ] Notification before scheduled post
- [ ] Execute scheduled posts (publish to clipboard)
- [ ] Post status management (draft, scheduled, published)

#### 10. Push Notifications
- [ ] Expo Push Notifications setup
- [ ] Notification triggers:
  - Trending topic matches user interests
  - Posting cadence reminder ("You're behind on your goal")
  - Optimal posting time alert
  - Scheduled post ready to publish
- [ ] Deep links to specific screens (mybrand://draft/{id})

#### 11. Mobile App (React Native + Expo)
- [ ] **Home Tab**: Dashboard with stats, scheduled posts, posting streak
- [ ] **Post Tab**: Daily suggestions, create new, edit drafts, schedule
- [ ] **Social Tab**: Content library, inspiration feed, trending topics
- [ ] **Analytics Tab**: Basic engagement metrics, post performance
- [ ] **Profile Tab**: User settings, preferences, LinkedIn connection
- [ ] Bottom tab navigation
- [ ] Onboarding flow screens
- [ ] Post editor with preview
- [ ] Schedule picker with AI suggestions

#### 12. API Endpoints (FastAPI)
**Auth:**
- POST /auth/signup
- POST /auth/login
- GET /auth/me

**Onboarding:**
- POST /onboarding
- GET /brand-blueprint
- PUT /brand-blueprint

**Posts:**
- POST /posts/generate (body: {topic, source_type})
- GET /posts (query: status=draft|scheduled|published)
- GET /posts/{id}
- PUT /posts/{id}
- DELETE /posts/{id}
- POST /posts/{id}/schedule (body: {scheduled_for})
- POST /posts/{id}/publish

**News:**
- GET /news/trending (query: topics)
- GET /news/suggestions (personalized for user)

**Analytics:**
- GET /analytics/overview
- GET /analytics/posts/{id}

**Notifications:**
- POST /notifications/register-token (Expo push token)

#### 13. Database Schema (Supabase - `sparkle` schema)
- [x] users table
- [x] brand_blueprints table
- [x] posts table
- [x] post_embeddings table (pgvector)
- [ ] news_articles table
- [ ] embeddings table (unified for RAG)
- [ ] notification_tokens table
- [ ] scheduled_jobs table

#### 14. Infrastructure
- [ ] FastAPI app deployment (Fly.io or Render)
- [ ] Supabase project configured
- [ ] Environment variables (Doppler or .env)
- [ ] GitHub repository setup
- [ ] Basic logging (structured logs)

#### 15. Testing & Quality
- [ ] Manual testing of all flows
- [ ] Test onboarding → post generation → scheduling → notification
- [ ] Test multi-user isolation (RLS working)
- [ ] Test on iOS and Android devices

---

## Phase 2: Growth & Optimization (Months 4-6)

### Goal
Improve user experience, scale backend, add advanced features

### Features

#### 1. Redis Caching Layer
- [ ] Cache LLM responses (avoid duplicate expensive calls)
- [ ] Cache hot news articles (last 24 hours)
- [ ] Rate limiting storage
- [ ] Active draft sessions

#### 2. Advanced Voice Learning
- [ ] Track user edit patterns
- [ ] A/B test post variations
- [ ] Engagement-based reinforcement learning
- [ ] Tone classifier (warm vs assertive vs innovative)

#### 3. LinkedIn API Integration (v2 Publishing)
- [ ] OAuth connection to LinkedIn
- [ ] Auto-publish posts via API
- [ ] Fetch real engagement metrics (likes, comments, shares)
- [ ] Import user's past LinkedIn posts for voice learning

#### 4. Enhanced News Pipeline
- [ ] Trending detection algorithm (spike detection)
- [ ] Social signals (track LinkedIn trending topics)
- [ ] User network analysis (what are people in their industry discussing)
- [ ] Personalized trend scoring

#### 5. Celery + Redis (Distributed Jobs)
- [ ] Migrate from APScheduler to Celery
- [ ] Distributed task queue
- [ ] Background workers for:
  - News ingestion
  - Embedding generation
  - Post publishing
  - Analytics processing

#### 6. Advanced Analytics
- [ ] Topic performance analysis
- [ ] Tone effectiveness tracking
- [ ] Best posting time ML model
- [ ] Hashtag performance
- [ ] Audience growth tracking
- [ ] Weekly summary reports

#### 7. Monitoring & Observability
- [ ] Sentry error tracking
- [ ] Prometheus metrics
- [ ] Grafana dashboards
- [ ] API performance monitoring
- [ ] LLM cost tracking

#### 8. Rate Limiting & Security
- [ ] slowapi rate limiting on all endpoints
- [ ] LLM call limits per user (10 generations/hour)
- [ ] Content safety filters
- [ ] API key rotation

#### 9. UI/UX Improvements
- [ ] Smooth animations
- [ ] Skeleton loaders
- [ ] Optimistic updates
- [ ] Offline draft support (SQLite)
- [ ] Image generation for posts (DALL-E, Stable Diffusion)

#### 10. Content Library
- [ ] Curated high-performing LinkedIn posts
- [ ] Templates by category
- [ ] "Adapt this post" feature
- [ ] Bookmarking system

---

## Phase 3: Scale & Expand (Months 7-12)

### Goal
Support 10,000+ users, add new platforms, advanced AI features

### Features

#### 1. Multi-Platform Support
- [ ] Instagram integration
- [ ] Twitter/X integration
- [ ] Cross-post to multiple platforms
- [ ] Platform-specific formatting

#### 2. Advanced AI Features
- [ ] Multi-modal RAG (text + images)
- [ ] Custom fine-tuned models for voice
- [ ] Image generation with brand consistency
- [ ] Video clip suggestions

#### 3. Collaboration Features
- [ ] Team accounts
- [ ] Approval workflows
- [ ] Brand guidelines enforcement
- [ ] Multi-user editing

#### 4. Microservices (If Needed)
- [ ] Separate services for:
  - Content generation
  - News ingestion
  - Analytics
  - Notifications

#### 5. Enterprise Features
- [ ] SSO authentication
- [ ] Custom branding
- [ ] Advanced analytics
- [ ] API access for integrations

#### 6. Mobile App Enhancements
- [ ] Apple Watch companion app
- [ ] Widgets (iOS/Android)
- [ ] Siri/Google Assistant shortcuts
- [ ] In-app post preview rendering

---

## Development Guidelines

### For Each Feature:
1. **Design** → API contracts, database schema
2. **Backend** → FastAPI endpoints + agents + jobs
3. **Frontend** → React Native screens + components
4. **Test** → Manual testing on device
5. **Deploy** → Push to production

### Code Quality Rules:
- Follow CLAUDE_RULES.md at all times
- Reference TECH_STACK.md for approved technologies
- Check DATABASE_SCHEMA.md before creating tables
- Review UI_FLOW.md before building screens
- Test on both iOS and Android

### When Blocked:
- Ask clarifying questions
- Consult documentation files
- Propose solution, wait for approval
- Never introduce new tech without permission

---

## Success Metrics

### Phase 1 Success:
- [ ] 10 beta users actively posting
- [ ] Users generate 3+ posts per week
- [ ] 80% of generated posts are published (or edited then published)
- [ ] App doesn't crash
- [ ] Users report "sounds like me" for voice matching

### Phase 2 Success:
- [ ] 100+ active users
- [ ] LinkedIn API publishing works reliably
- [ ] Real engagement data flowing in
- [ ] Users see measurable follower growth

### Phase 3 Success:
- [ ] 1,000+ active users
- [ ] Multi-platform support
- [ ] Profitable (subscriptions > costs)
- [ ] NPS score > 50

---

## Current Status

**Phase:** 1 (MVP)
**Started:** [Date]
**Target Completion:** [Date + 3 months]

### Completed:
- [x] Project setup
- [x] Documentation structure
- [x] Supabase database setup
- [x] Backend project initialized
- [x] Mobile project initialized (planned)

### In Progress:
- [ ] Database schema implementation
- [ ] Authentication setup
- [ ] First API endpoints

### Next Steps:
1. Create database tables in Supabase
2. Build authentication endpoints
3. Implement news ingestion pipeline
4. Build RAG system
5. Create LLM gateway

---

## Notes

- Always work incrementally (one feature at a time)
- Test each feature before moving to next
- Don't overengineer - ship working code
- Prioritize user value over technical perfection
- Reference this file to know what to build next
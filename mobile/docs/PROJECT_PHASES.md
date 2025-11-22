# Sparkle Development Phases

## Current Phase: **Phase 1 (MVP) - Backend Complete, Starting Mobile**

---

## Development Philosophy

### Full-Stack Feature Development

**CRITICAL: For EVERY feature, build BOTH backend AND mobile together.**

**Workflow for each feature:**
1. **Backend** → Create API endpoints and business logic
2. **Mobile** → Create screens that use those endpoints  
3. **Integration** → Test complete user flow on device
4. **Only then** → Move to next feature

**❌ WRONG:** Build all backend, then build all mobile
**✅ RIGHT:** Build one complete feature (backend + mobile), test it, then next feature

---

## Phase 1: MVP (Months 1-3)

### Goal
Launch working mobile app where users can:
- Onboard with brand blueprint
- Get AI-generated LinkedIn posts (matching their voice)
- Posts based on trending news in their topics
- Schedule and publish posts
- Track basic analytics

---

### Feature 1: Database Schema & Setup ✅ COMPLETE

**Backend:**
- [x] Create `sparkle` schema in Supabase
- [x] Create all tables:
  - [x] users
  - [x] brand_blueprints
  - [x] posts
  - [x] post_embeddings (with pgvector)
  - [x] news_articles (ready for Feature 5)
  - [x] embeddings (unified RAG table, ready for Feature 6)
  - [x] notification_tokens (ready for Feature 10)
- [x] Add indexes for performance
- [x] Set up Row-Level Security (RLS) policies
- [x] Create migration file: `/backend/migrations/001_initial_schema.sql`

**Mobile:**
- [ ] Initialize React Native + Expo project
- [ ] Set up project structure (/screens, /components, /services, /contexts)
- [ ] Configure Expo app.json
- [ ] Set up navigation (React Navigation with bottom tabs)

**Infrastructure:**
- [x] FastAPI project structure in `/backend`
- [x] Environment variables setup (.env)
- [x] Supabase client configuration
- [x] Basic main.py with CORS
- [x] Clean architecture (routers → services → database)
- [x] Pydantic Settings for type-safe configuration

**Testing:**
- [x] Verify tables created in Supabase
- [ ] Verify mobile app runs on iOS simulator
- [ ] Verify mobile app runs on Android emulator

---

### Feature 2: Authentication & User Management ✅ BACKEND COMPLETE

**Backend (`/backend/api/auth.py`):** ✅ COMPLETE
- [x] Mock authentication system for Phase 1 (USE_MOCK_AUTH=True)
- [x] POST /auth/signup endpoint (mock)
- [x] POST /auth/login endpoint (mock)
- [x] GET /auth/me endpoint (mock)
- [x] Auth middleware with conditional logic
- [x] Mock user seeded (test@sparkle.com)
- [x] JWT verification structure preserved for Phase 2
- [x] Error handling for auth failures
- [x] Documentation: MOCK_AUTH_SETUP.md

**Mobile (`/mobile/screens/auth/`):** 🚧 TODO
- [ ] Login.tsx screen
  - [ ] Email + password form
  - [ ] Form validation (Zod)
  - [ ] Call POST /auth/login (mock endpoint)
  - [ ] Handle errors (show toast/alert)
- [ ] Signup.tsx screen
  - [ ] Email + password + name form
  - [ ] Form validation
  - [ ] Call POST /auth/signup (mock endpoint)
  - [ ] Handle errors
- [ ] AuthContext.tsx (state management)
  - [ ] Store JWT in AsyncStorage
  - [ ] Provide auth state to app
  - [ ] Auto-login on app launch (if token exists)
- [ ] AuthService.ts (API calls)
  - [ ] login() function
  - [ ] signup() function
  - [ ] logout() function
  - [ ] getCurrentUser() function
- [ ] Protected route navigation
  - [ ] If logged in → Home
  - [ ] If not logged in → Login/Signup

**Integration Testing:** 🚧 TODO
- [ ] Test signup flow: Mobile app → Backend → Database
- [ ] Test login flow: Mobile app → Backend → Return token
- [ ] Test token storage: Close app → Reopen → Still logged in
- [ ] Test logout: Clear token → Redirect to login
- [ ] Test on both iOS and Android

**Phase 2 Transition Plan:**
- Switch USE_MOCK_AUTH=False in .env
- Real Supabase JWT verification already implemented
- No code changes needed, just configuration

---

### Feature 3: Onboarding Flow (Brand Blueprint) ✅ BACKEND COMPLETE

**Backend (`/backend/api/onboarding.py`):** ✅ COMPLETE
- [x] POST /onboarding/brand-blueprint endpoint
  - [x] Accept: topics, main_goal, tone, inspirations, posting_preferences
  - [x] Validate with Pydantic model (BrandBlueprintCreate)
  - [x] Create record in brand_blueprints table
  - [x] Link to user_id from auth
  - [x] Return created blueprint
- [x] GET /onboarding/brand-blueprint endpoint
  - [x] Return user's brand blueprint
  - [x] Return 404 if doesn't exist
- [x] PUT /onboarding/brand-blueprint endpoint
  - [x] Update existing blueprint (BrandBlueprintUpdate)
  - [x] Validate changes
  - [x] Preserve existing values if not provided
- [x] Documentation: ONBOARDING_ENDPOINTS.md

**Mobile (`/mobile/screens/onboarding/`):** 🚧 TODO
- [ ] Onboarding1.tsx - Welcome screen
  - [ ] Welcome message
  - [ ] "Get Started" button → Navigate to Onboarding2
  - [ ] Match UI_MOCKUPS/Onboarding1.png
- [ ] Onboarding2.tsx - Brand preferences
  - [ ] Multi-select: Topics (AI, Finance, Leadership, etc.)
  - [ ] Dropdown: Main goal (Top Voice, Visibility, Attract headhunters)
  - [ ] Dropdown: Tone (Warm, Assertive, Innovative)
  - [ ] Text input: Inspirations (top voices/creators)
  - [ ] "Next" button → Navigate to Onboarding3
  - [ ] Match UI_MOCKUPS/Onboarding2.png
- [ ] Onboarding3.tsx - Posting preferences
  - [ ] Multi-select: Preferred posting days
  - [ ] Time picker: Preferred posting hours
  - [ ] Number input: Posts per week (cadence)
  - [ ] Toggle: "Ask before publish"
  - [ ] "Complete Setup" button → Call POST /onboarding/brand-blueprint → Navigate to Home
  - [ ] Match UI_MOCKUPS/Onboarding3.png
- [ ] OnboardingContext.tsx
  - [ ] Store onboarding form state
  - [ ] Submit to backend on completion
- [ ] Follow DESIGN_GUIDELINES.md (44x44pt touch targets, accessibility)

**Integration Testing:** 🚧 TODO
- [ ] Complete onboarding flow on mobile
- [ ] Verify data saved in brand_blueprints table
- [ ] Test: Skip onboarding if already completed (check on app launch)
- [ ] Test: Can edit preferences later from Profile
- [ ] Test on both iOS and Android

---

### Feature 4: Posts Management ✅ BACKEND COMPLETE

**Backend (`/backend/api/posts.py`):** ✅ COMPLETE
- [x] POST /api/v1/posts - Create new post
  - [x] Body: {content, source_type, source_id}
  - [x] Validate with PostCreate model
  - [x] Store in posts table (status='draft')
  - [x] Link to user_id
  - [x] Return created post
- [x] GET /api/v1/posts - List posts with filters
  - [x] Query params: status, limit, offset, sort
  - [x] Pagination support
  - [x] Return only user's posts
  - [x] Sort by created_at DESC
- [x] GET /api/v1/posts/{post_id} - Get specific post
  - [x] Verify ownership
  - [x] Return 404 if not found
  - [x] Return 403 if not owner
- [x] PUT /api/v1/posts/{post_id} - Update post
  - [x] Body: {content, status, hashtags, image_url}
  - [x] Validate with PostUpdate model
  - [x] Verify ownership
  - [x] Update only provided fields
- [x] DELETE /api/v1/posts/{post_id} - Delete post
  - [x] Soft delete (status='discarded')
  - [x] Verify ownership
- [x] POST /api/v1/posts/{post_id}/schedule - Schedule post
  - [x] Body: {scheduled_for: ISO timestamp}
  - [x] Validate future time
  - [x] Update status='scheduled'
  - [x] Prevent conflicts (409 if already scheduled/published)
- [x] POST /api/v1/posts/{post_id}/publish - Publish post
  - [x] Update status='published'
  - [x] Set published_at timestamp
  - [x] Prevent duplicate publishing
- [x] Security: Ownership verification on all operations
- [x] Status transition management
- [x] Comprehensive error handling (404, 403, 409, 422)
- [x] Documentation: POSTS_API_COMPLETE.md

**Mobile (`/mobile/screens/posts/`):** 🚧 TODO
- [ ] CreatePostScreen.tsx (Create_new_post1.png)
  - [ ] Text input for post content (manual entry)
  - [ ] "Generate with AI" button (placeholder for Feature 8)
  - [ ] "Save Draft" button → Call POST /api/v1/posts
  - [ ] Navigate to EditPost on success
- [ ] DailyPostSuggestionsScreen.tsx (Create_new_post2.png)
  - [ ] Placeholder screen for Feature 8 (AI generation)
  - [ ] Show "Coming soon" message
- [ ] EditPostScreen.tsx (Editpost.png)
  - [ ] Text editor for post content
  - [ ] Character count
  - [ ] Preview mode toggle
  - [ ] Action buttons:
    - [ ] "Save Draft" → PUT /api/v1/posts/{id}
    - [ ] "Schedule" → Navigate to ScheduleScreen
    - [ ] "Publish Now" → POST /api/v1/posts/{id}/publish + copy to clipboard
    - [ ] "Discard" → DELETE /api/v1/posts/{id}
  - [ ] Match UI_MOCKUPS/Editpost.png
- [ ] PostsListScreen.tsx
  - [ ] Fetch GET /api/v1/posts
  - [ ] Filter tabs: All, Drafts, Scheduled, Published
  - [ ] Pull-to-refresh
  - [ ] Tap post → Navigate to EditPost
- [ ] PostService.ts (API calls)
  - [ ] createPost(content, source_type)
  - [ ] getPosts(status, limit, offset)
  - [ ] getPost(postId)
  - [ ] updatePost(postId, updates)
  - [ ] deletePost(postId)
  - [ ] schedulePost(postId, scheduledFor)
  - [ ] publishPost(postId)
- [ ] Use React Query for data fetching

**Integration Testing:** 🚧 TODO
- [ ] Create post manually → Verify saved as draft
- [ ] Edit post → Verify updated
- [ ] Delete post → Verify status='discarded'
- [ ] Schedule post → Verify status='scheduled'
- [ ] Publish post → Verify status='published' + published_at set
- [ ] List posts with filters → Verify correct results
- [ ] Test ownership isolation (user can't edit others' posts)
- [ ] Test on both iOS and Android

---

### Feature 5: LLM Integration (Gateway Pattern) 🚧 TODO (Phase 1 Priority)

**Backend (`/backend/services/llm_service.py`):**
- [ ] LLMService class with provider abstraction
- [ ] Support OpenAI (primary)
- [ ] Support Anthropic Claude (secondary)
- [ ] Configuration via environment variable (LLM_PROVIDER)
- [ ] Methods:
  - [ ] generate_post(prompt, user_context)
  - [ ] summarize_news(article_text)
  - [ ] match_voice(user_posts, new_topic)
- [ ] Error handling and retries
- [ ] Prompt templates for different tasks
- [ ] Cost tracking (log token usage)

**Backend (`/backend/config/prompts.py`):**
- [ ] Prompt templates:
  - [ ] POST_GENERATION_PROMPT
  - [ ] NEWS_SUMMARIZATION_PROMPT
  - [ ] VOICE_MATCHING_PROMPT

**Mobile:**
- [ ] No mobile changes for this feature
- [ ] LLM is backend-only

**Testing:**
- [ ] Test LLM call with OpenAI
- [ ] Test provider switching (OpenAI → Claude)
- [ ] Test error handling (invalid API key)
- [ ] Verify prompts produce good outputs

---

### Feature 6: News Ingestion Pipeline 🚧 TODO (Phase 1 Priority)

**Backend (`/backend/agents/news_agent.py`):**
- [ ] NewsAgent class
- [ ] fetch_rss_feeds() method
- [ ] fetch_news_api() method (NewsAPI/GNews fallback)
- [ ] deduplicate_articles() method
- [ ] classify_topics() method (spaCy NER)
- [ ] calculate_trust_score() method
- [ ] store_articles() method
- [ ] Generate embeddings for RAG

**Backend (`/backend/jobs/news_jobs.py`):**
- [ ] APScheduler job: fetch_news_periodic() (every 6 hours)
- [ ] APScheduler job: cleanup_old_news() (daily, 30-day retention)

**Backend (`/backend/data/rss_feeds.json`):**
- [ ] Curated RSS feed list per category (AI, Finance, Leadership, Tech)

**Mobile:**
- [ ] No mobile changes
- [ ] News ingestion is backend-only

**Testing:**
- [ ] Manually trigger news fetch
- [ ] Verify articles stored in database
- [ ] Verify embeddings generated
- [ ] Verify deduplication works
- [ ] Verify cleanup job works

---

### Feature 7: RAG System 🚧 TODO (Phase 1 Priority)

**Backend (`/backend/services/rag_service.py`):**
- [ ] RAGService class
- [ ] retrieve_content(query, topics, limit=5)
- [ ] retrieve_voice(user_id, limit=10)
- [ ] retrieve_templates(category, limit=3)
- [ ] hybrid_retrieve(query, user_id)
- [ ] keyword_search(query, table)
- [ ] Create vector indexes on embeddings table

**Mobile:**
- [ ] No mobile changes
- [ ] RAG is backend-only

**Testing:**
- [ ] Test content retrieval
- [ ] Test voice retrieval
- [ ] Test template retrieval
- [ ] Test hybrid retrieval
- [ ] Verify user isolation

---

### Feature 8: Voice Learning System 🚧 TODO (Phase 1 Priority)

**Backend (`/backend/services/voice_service.py`):**
- [ ] VoiceService class
- [ ] analyze_user_posts(user_id)
- [ ] embed_user_posts(user_id)
- [ ] learn_from_edit(original, edited, user_id)
- [ ] get_voice_context(user_id, topic)

**Mobile:**
- [ ] No mobile changes
- [ ] Voice learning is backend-only

**Testing:**
- [ ] Create test user with sample posts
- [ ] Analyze posts and verify metrics
- [ ] Test voice retrieval
- [ ] Test edit learning

---

### Feature 9: Post Generation Agent 🚧 TODO (Phase 1 Priority)

**Backend (`/backend/agents/generation_agent.py`):**
- [ ] GenerationAgent class
- [ ] generate_from_news(news_article_id, user_id)
- [ ] generate_evergreen(topic, user_id)
- [ ] generate_from_scratch(user_input, user_id)
- [ ] refine_post(post_id, feedback)
- [ ] suggest_hashtags(post_content)
- [ ] suggest_hook(post_content)

**Backend:** Update POST /api/v1/posts endpoint
- [ ] Add AI generation logic
- [ ] Use GenerationAgent when source_type='ai'

**Mobile:** Update screens
- [ ] CreatePostScreen: "Generate with AI" button works
- [ ] DailyPostSuggestionsScreen: Show AI-generated suggestions
- [ ] Add hashtag/hook suggestions to EditPost

**Integration Testing:**
- [ ] Generate post from news
- [ ] Generate evergreen post
- [ ] Generate from user idea
- [ ] Verify voice matching

---

### Feature 10: Scheduling System 🚧 TODO (Phase 1 Priority)

**Backend (`/backend/agents/scheduling_agent.py`):**
- [ ] SchedulingAgent class
- [ ] calculate_optimal_time(user_id)
- [ ] schedule_post(post_id, scheduled_for)
- [ ] execute_scheduled_post(post_id)

**Backend (`/backend/jobs/scheduling_jobs.py`):**
- [ ] APScheduler dynamic job creation
- [ ] Job runs at scheduled_for time

**Backend:** Already have POST /api/v1/posts/{id}/schedule
- [x] Endpoint exists
- [ ] Integrate with SchedulingAgent

**Mobile (`/mobile/screens/posts/`):**
- [ ] ScheduleScreen.tsx (Schedule.png)
- [ ] SchedulePickerModal.tsx
- [ ] Show optimal time suggestions

**Mobile (Push Notifications):**
- [ ] Handle notification when scheduled post ready
- [ ] Deep link to post

**Integration Testing:**
- [ ] Schedule post
- [ ] Verify appears in Schedule screen
- [ ] Trigger scheduled job
- [ ] Verify notification sent
- [ ] Test on both platforms

---

### Feature 11: Push Notifications 🚧 TODO (Phase 1)

**Backend (`/backend/api/notifications.py`):**
- [ ] POST /notifications/register-token
- [ ] DELETE /notifications/unregister-token

**Backend (`/backend/services/notification_service.py`):**
- [ ] NotificationService class
- [ ] send_notification(user_id, title, body, data)
- [ ] Notification triggers (trending, reminder, optimal time, scheduled post)

**Mobile (`/mobile/services/notificationService.ts`):**
- [ ] Initialize Expo Notifications
- [ ] Request permissions
- [ ] Get Expo push token
- [ ] Register token on login
- [ ] Handle notifications

**Mobile (Deep Linking):**
- [ ] Configure deep links in app.json
- [ ] Handle deep link navigation

**Integration Testing:**
- [ ] Register push token
- [ ] Send test notification
- [ ] Tap notification → Correct screen opens
- [ ] Test all notification types
- [ ] Test on both platforms

---

### Feature 12: Home Dashboard 🚧 TODO (Phase 1)

**Backend (`/backend/api/analytics.py`):**
- [ ] GET /analytics/overview
- [ ] GET /analytics/best-time

**Mobile (`/mobile/screens/home/`):**
- [ ] HomeScreen.tsx (Home1.png)
  - [ ] Stats cards
  - [ ] Best time to post section
  - [ ] Scheduled posts preview
  - [ ] Quick actions
  - [ ] Match UI_MOCKUPS/Home1.png

**Integration Testing:**
- [ ] Open app → Home loads
- [ ] Verify stats accurate
- [ ] Test quick actions
- [ ] Pull-to-refresh
- [ ] Test on both platforms

---

### Feature 13: Social Tab 🚧 TODO (Phase 1)

**Backend (`/backend/api/social.py`):**
- [ ] GET /social/content-library
- [ ] GET /social/trending
- [ ] GET /social/top-voices

**Backend (Seed Data):**
- [ ] Curate 50-100 high-performing posts
- [ ] Store in database (type='template')

**Mobile (`/mobile/screens/social/`):**
- [ ] SocialScreen.tsx (social1.png)
- [ ] TrendingScreen.tsx (social2.png)

**Integration Testing:**
- [ ] Browse content library
- [ ] Filter by topic
- [ ] Adapt a post
- [ ] View trending topics
- [ ] Test on both platforms

---

### Feature 14: Analytics Tab 🚧 TODO (Phase 1)

**Backend (`/backend/api/analytics.py`):**
- [ ] GET /analytics/posts
- [ ] GET /analytics/posts/{post_id}
- [ ] GET /analytics/topics
- [ ] GET /analytics/tone

**Mobile (`/mobile/screens/analytics/`):**
- [ ] AnalyticsOverviewScreen.tsx (Analytics1.png)
- [ ] PostAnalyticsScreen.tsx (Analytics2.png)

**Integration Testing:**
- [ ] View analytics overview
- [ ] Verify charts render
- [ ] View post details
- [ ] Test on both platforms

---

### Feature 15: Profile & Settings 🚧 TODO (Phase 1)

**Backend (`/backend/api/profile.py`):**
- [ ] GET /profile
- [ ] PUT /profile
- [ ] PUT /brand-blueprint (already exists)
- [ ] POST /profile/linkedin-connect (v2)
- [ ] DELETE /profile/linkedin-disconnect (v2)

**Mobile (`/mobile/screens/profile/`):**
- [ ] ProfileScreen.tsx (Profile1.png)
- [ ] SettingsScreen.tsx (Profile2.png)

**Integration Testing:**
- [ ] View profile
- [ ] Edit name → Verify saved
- [ ] Edit preferences → Verify saved
- [ ] Test on both platforms

---

### Feature 16: Final Integration & Polish 🚧 TODO (Phase 1)

**Backend:**
- [ ] Request logging
- [ ] Error handling middleware
- [ ] Rate limiting (slowapi)
- [x] API documentation at /docs
- [ ] Health check endpoint

**Mobile:**
- [ ] Error boundaries
- [ ] Offline support (SQLite for drafts)
- [ ] Loading states
- [ ] Empty states
- [ ] Success/error toasts
- [ ] Animations
- [ ] App icon and splash screen

**Infrastructure:**
- [ ] Deploy to Fly.io/Render
- [ ] Configure production env vars
- [ ] HTTPS setup
- [ ] CORS for mobile
- [ ] Sentry setup

**Testing:**
- [ ] End-to-end user journey
- [ ] Multi-user testing
- [ ] Device testing (iOS + Android)
- [ ] Performance testing

---

## Phase 1 Status Summary

### ✅ Completed (Backend Only):
- Infrastructure & Project Setup
- Database Schema
- Mock Authentication System
- Onboarding API (3 endpoints)
- Posts API (7 endpoints)
- API Documentation
- GitHub Repository Setup

### 🚧 In Progress:
- **Next Priority:** Mobile app initialization (Feature 1 mobile tasks)
- **Then:** Authentication screens (Feature 2 mobile tasks)
- **Then:** Onboarding screens (Feature 3 mobile tasks)

### 🔜 TODO (High Priority for MVP):
- LLM Integration (Feature 5)
- News Ingestion (Feature 6)
- RAG System (Feature 7)
- Voice Learning (Feature 8)
- Post Generation Agent (Feature 9)
- All remaining mobile screens

### 📊 Phase 1 Progress: ~30% Complete
- Backend foundation: ✅ Complete
- Mobile development: 🚧 Starting
- AI/ML features: 🔜 Next phase
- Integration & polish: 🔜 Final phase

---

## Current Development Focus

### Immediate Next Steps:

**Step 1: Initialize Mobile App**
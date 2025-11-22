# Sparkle ✨

AI personal-branding copilot for LinkedIn. Mobile-first React Native app with FastAPI backend.

## Project Overview

Sparkle helps professionals consistently share authentic, high-quality content on LinkedIn without spending hours brainstorming, drafting, or keeping up with trends. It continuously learns your tone and engagement patterns, acting as a true long-term branding copilot.

## Project Structure

```
Sparkle/
├── backend/          # FastAPI backend (Phase 1 MVP complete)
│   ├── config/       # Settings and configuration
│   ├── models/       # Pydantic schemas
│   ├── routers/      # API endpoints
│   ├── services/     # Business logic
│   ├── middleware/   # Auth middleware
│   ├── migrations/   # Database migrations
│   └── docs/         # API documentation
│
├── mobile/           # React Native + Expo (planned)
│   └── docs/         # Mobile app documentation
│       └── UI_MOCKUPS/  # Design mockups
│
└── README.md         # This file
```

## Backend (Phase 1 MVP) ✅

### Features Implemented

- ✅ **Authentication System** (Mock auth for Phase 1 development)
- ✅ **Onboarding API** - Brand blueprint creation and management
- ✅ **Posts API** - Complete CRUD operations (7 endpoints)
  - Create, list, view, edit, delete posts
  - Schedule posts for future publication
  - Publish posts (mark as published)
- ✅ **Supabase Integration** - PostgreSQL with Row Level Security
- ✅ **CORS Configuration** - Ready for mobile app
- ✅ **API Documentation** - Auto-generated with FastAPI

### Tech Stack

**Backend:**
- FastAPI (async Python)
- Supabase (PostgreSQL + Auth)
- Pydantic v2 (validation)
- Python-jose (JWT for Phase 2)
- Uvicorn (ASGI server)

**Database:**
- PostgreSQL (Supabase)
- pgvector (for embeddings - Phase 2)
- Row Level Security (RLS)

## Quick Start

### Backend Setup

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

5. **Run the server:**
   ```bash
   uvicorn main:app --reload
   ```

6. **Access API docs:**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

### Database Setup

1. Create a Supabase project
2. Run the migration SQL files in `/backend/migrations/`
3. Run the mock user seed (Phase 1 only): `000_seed_mock_user.sql`

## API Endpoints

### Authentication
- `GET /api/v1/auth/me` - Get current user

### Onboarding
- `POST /api/v1/onboarding/brand-blueprint` - Create brand blueprint
- `GET /api/v1/onboarding/brand-blueprint` - Get user's blueprint
- `PUT /api/v1/onboarding/brand-blueprint` - Update preferences

### Posts
- `POST /api/v1/posts` - Create new post
- `GET /api/v1/posts` - List posts (with filters)
- `GET /api/v1/posts/{id}` - Get specific post
- `PUT /api/v1/posts/{id}` - Update post
- `DELETE /api/v1/posts/{id}` - Delete post
- `POST /api/v1/posts/{id}/schedule` - Schedule post
- `POST /api/v1/posts/{id}/publish` - Publish post

### Health
- `GET /health` - Health check

## Documentation

### Backend Documentation
- [Setup Guide](backend/SETUP_COMPLETE.md)
- [Mock Authentication](backend/MOCK_AUTH_SETUP.md)
- [Onboarding Endpoints](backend/ONBOARDING_ENDPOINTS.md)
- [Posts API](backend/POSTS_API_COMPLETE.md)
- [Database Schema](mobile/docs/DATABASE_SCHEMA.md)

### Project Documentation
- [Product Requirements (PRD)](mobile/docs/PRD.md)
- [Tech Stack](mobile/docs/TECH_STACK.md)
- [UI Flow](mobile/docs/UI_FLOW.md)
- [Design Guidelines](mobile/docs/DESIGN_GUIDELINES.md)
- [Project Phases](mobile/docs/PROJECT_PHASES.md)
- [Development Rules](mobile/docs/CLAUDE.md)

## Development Phases

### Phase 1: MVP (Current) ✅
- ✅ Backend API structure
- ✅ Mock authentication
- ✅ Onboarding flow
- ✅ Posts management
- ⏳ AI post generation (next)
- ⏳ News ingestion pipeline
- ⏳ Mobile app (React Native)

### Phase 2: Growth & Optimization (Planned)
- Real Supabase authentication
- LinkedIn API integration
- Real engagement metrics
- Advanced voice learning
- Redis caching
- Celery job queue

### Phase 3: Scale & Expand (Planned)
- Multi-platform support (Instagram, Twitter)
- Advanced AI features
- Team collaboration
- Enterprise features

## Current Status

**Phase:** 1 (MVP Development)
**Backend:** ✅ Complete (Auth, Onboarding, Posts)
**Mobile:** ⏳ Planned
**Deployment:** 🚀 Ready for testing

## Contributing

This is a private project. Development guidelines are in [CLAUDE.md](mobile/docs/CLAUDE.md).

## License

Proprietary - All rights reserved

---

**Built with:** FastAPI, React Native, Supabase, OpenAI
**Status:** Active Development (Phase 1 MVP)
**Last Updated:** January 2025

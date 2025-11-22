# Sparkle Backend API

FastAPI backend for Sparkle - AI personal-branding copilot for LinkedIn.

## Setup

### 1. Install Dependencies

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase anon/public key
- `SUPABASE_JWT_SECRET` - Your Supabase JWT secret (from project settings)
- `USE_MOCK_AUTH` - Set to `True` for Phase 1 (default), `False` for Phase 2

### 3. Seed Mock User (Phase 1 Only)

Run the SQL seed script in your Supabase SQL Editor:

```sql
-- File: migrations/000_seed_mock_user.sql
-- Creates test user with ID: 123e4567-e89b-12d3-a456-426614174000
```

This creates a mock user that the authentication system will use during Phase 1 development.

### 4. Run the Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure

```
backend/
├── main.py                 # FastAPI app entry point
├── database.py             # Supabase client
├── requirements.txt        # Python dependencies
├── .env.example           # Environment template
├── .gitignore             # Git ignore rules
│
├── config/                 # Configuration
│   ├── __init__.py
│   └── settings.py        # Pydantic Settings
│
├── models/                 # Pydantic schemas
│   ├── __init__.py
│   ├── user.py
│   ├── post.py
│   └── brand_blueprint.py
│
├── routers/                # API endpoints
│   ├── __init__.py
│   ├── health.py          # Health check
│   └── auth.py            # Authentication
│
├── services/               # Business logic
│   ├── __init__.py
│   └── auth_service.py    # JWT verification
│
└── middleware/             # Middleware
    ├── __init__.py
    └── auth_middleware.py # Auth dependency
```

## Available Endpoints

### Health Check
- `GET /health` - Check API and database status

### Authentication (API v1)
- `GET /api/v1/auth/me` - Get current user info (requires JWT)

## Testing Endpoints

### Health Check
```bash
curl http://localhost:8000/health
```

### Get Current User (Phase 1 - Mock Auth)
```bash
# No authentication required in Phase 1
curl http://localhost:8000/api/v1/auth/me

# Returns mock user:
# {
#   "status": "success",
#   "data": {
#     "id": "123e4567-e89b-12d3-a456-426614174000",
#     "email": "test@sparkle.com",
#     "full_name": "Test User",
#     ...
#   }
# }
```

## Authentication

### Phase 1: Mock Authentication (Current)

**Status**: ✅ Active

Mock authentication is enabled by default for Phase 1 MVP development. This allows you to develop and test all protected endpoints without setting up real authentication.

**How it works:**
- No JWT token required
- All protected routes return the same mock user
- Mock user ID: `123e4567-e89b-12d3-a456-426614174000`
- Email: `test@sparkle.com`

**Configuration:**
```env
USE_MOCK_AUTH=True  # Default for Phase 1
```

**Benefits:**
- ✅ Develop backend without waiting for frontend auth
- ✅ Test all endpoints immediately
- ✅ Foreign key constraints work with seeded user
- ✅ Easy to switch to real auth later

### Phase 2: Real Supabase Authentication (Future)

**Status**: ⏳ Planned

When frontend login is ready, switch to real authentication:

1. Set `USE_MOCK_AUTH=False` in `.env`
2. Ensure `SUPABASE_JWT_SECRET` is configured
3. Pass real JWT tokens in Authorization header:
   ```bash
   curl -H "Authorization: Bearer REAL_JWT_TOKEN" \
     http://localhost:8000/api/v1/auth/me
   ```

**Code locations:**
- Mock auth logic: `middleware/auth_middleware.py` (lines 34-42)
- Mock user function: `services/auth_service.py`
- Configuration: `config/settings.py`

## Development Guidelines

- Follow PEP 8 for Python code style
- Use async/await for all I/O operations
- Add type hints to all functions
- Keep functions under 50 lines
- Use Pydantic models for validation
- Return consistent JSON structure:
  ```json
  {
    "status": "success" | "error",
    "data": {},
    "message": "Optional message"
  }
  ```

## Next Steps (Phase 1 MVP)

- [ ] Onboarding endpoints (POST /api/v1/onboarding)
- [ ] Post generation endpoints
- [ ] News ingestion pipeline
- [ ] RAG system setup
- [ ] Scheduling system

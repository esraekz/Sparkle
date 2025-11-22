# ✅ Mock Authentication System - Phase 1 MVP

## Overview

Mock authentication has been implemented to enable Phase 1 backend development without waiting for real Supabase Auth integration. This allows all protected endpoints to work immediately with a test user.

---

## What Was Implemented

### 1. Mock User Service
**File**: `services/auth_service.py`

```python
MOCK_USER_ID = "123e4567-e89b-12d3-a456-426614174000"
MOCK_USER_EMAIL = "test@sparkle.com"
MOCK_USER_NAME = "Test User"

def get_mock_user() -> Dict[str, Any]:
    """Returns mock user for Phase 1 development"""
    return {
        "id": MOCK_USER_ID,
        "email": MOCK_USER_EMAIL,
        "full_name": MOCK_USER_NAME,
        "role": "authenticated",
    }
```

### 2. Updated Auth Middleware
**File**: `middleware/auth_middleware.py`

- Added `USE_MOCK_AUTH` configuration check
- Returns mock user when flag is `True`
- Preserves real JWT verification code for Phase 2
- Changed `HTTPBearer(auto_error=False)` to not require token in Phase 1

**Key Logic:**
```python
if settings.USE_MOCK_AUTH:
    return get_mock_user()  # Phase 1: Mock auth
else:
    # Phase 2: Real JWT verification
    user = get_user_from_token(token)
    return user
```

### 3. Configuration
**File**: `config/settings.py`

```python
# Authentication Configuration
# Phase 1: Use mock auth (no real JWT verification)
# Phase 2: Switch to real Supabase Auth (set to False)
USE_MOCK_AUTH: bool = True
```

### 4. Database Seed
**File**: `migrations/000_seed_mock_user.sql`

Inserts mock user into `sparkle_users` table:
- ID: `123e4567-e89b-12d3-a456-426614174000`
- Email: `test@sparkle.com`
- Full Name: `Test User`

This ensures foreign key constraints work properly.

---

## How to Use

### Setup (One-time)

1. **Ensure `.env` has mock auth enabled:**
   ```env
   USE_MOCK_AUTH=True
   ```

2. **Run the seed SQL in Supabase SQL Editor:**
   ```sql
   -- File: migrations/000_seed_mock_user.sql
   -- This creates the test user in sparkle_users table
   ```

3. **Start the server:**
   ```bash
   uvicorn main:app --reload
   ```

### Testing Protected Endpoints

All protected endpoints automatically use the mock user. No token required!

**Example:**
```bash
# Get current user - no Authorization header needed
curl http://localhost:8000/api/v1/auth/me

# Response:
{
  "status": "success",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "test@sparkle.com",
    "full_name": "Test User",
    "avatar_url": null,
    "linkedin_profile_url": null,
    "created_at": "2025-01-22T10:30:00Z",
    "updated_at": "2025-01-22T10:30:00Z"
  },
  "message": "User retrieved successfully"
}
```

### Using in Protected Routes

All existing protected routes continue to work as before:

```python
from middleware.auth_middleware import get_current_user

@router.get("/some-protected-route")
async def protected_route(current_user: dict = Depends(get_current_user)):
    # current_user contains mock user in Phase 1
    user_id = current_user["id"]  # "123e4567-e89b-12d3-a456-426614174000"
    email = current_user["email"]  # "test@sparkle.com"

    # Your endpoint logic here...
    return {"message": f"Hello {email}"}
```

---

## Benefits

✅ **No waiting for frontend auth** - Build and test backend immediately
✅ **Consistent test user** - All endpoints use same user ID
✅ **Foreign keys work** - Mock user exists in database
✅ **Easy to switch** - Toggle one flag for real auth
✅ **Preserved structure** - Auth dependency pattern unchanged

---

## Switching to Real Auth (Phase 2)

When frontend Supabase Auth is ready:

### Step 1: Update Environment
```env
USE_MOCK_AUTH=False
```

### Step 2: Ensure JWT Secret is Set
```env
SUPABASE_JWT_SECRET=your-real-jwt-secret
```

### Step 3: Pass Real Tokens
Frontend must include JWT in requests:
```javascript
fetch('http://localhost:8000/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${supabaseToken}`
  }
})
```

### Step 4: Clean Up (Optional)
- Remove mock user from database
- Remove `get_mock_user()` function
- Remove mock auth logic from middleware
- Delete `000_seed_mock_user.sql`

---

## Files Modified/Created

### Created
- ✅ `migrations/000_seed_mock_user.sql` - Database seed for mock user

### Modified
- ✅ `config/settings.py` - Added `USE_MOCK_AUTH` flag
- ✅ `services/auth_service.py` - Added `get_mock_user()` function
- ✅ `services/__init__.py` - Exported `get_mock_user`
- ✅ `middleware/auth_middleware.py` - Conditional mock/real auth
- ✅ `.env.example` - Added `USE_MOCK_AUTH` variable
- ✅ `README.md` - Documented mock auth system

---

## Code Locations

| Component | File | Lines |
|-----------|------|-------|
| Mock user constants | `services/auth_service.py` | 13-15 |
| Mock user function | `services/auth_service.py` | 18-36 |
| Auth middleware logic | `middleware/auth_middleware.py` | 34-42 |
| Configuration flag | `config/settings.py` | 21-24 |
| Database seed | `migrations/000_seed_mock_user.sql` | All |

---

## Testing Checklist

- [x] Mock user function returns correct data
- [x] Auth middleware uses mock when flag is True
- [x] Protected endpoints work without token
- [x] Mock user exists in database
- [x] Foreign key constraints work
- [x] Configuration can toggle between mock/real

---

## Important Notes

⚠️ **Security**: Mock auth should NEVER be enabled in production
⚠️ **Database**: Ensure mock user seed is run before testing
⚠️ **Phase 2**: Remember to update all frontend code to send real tokens

---

**Status**: ✅ Mock Authentication Fully Implemented
**Phase**: 1 (MVP Development)
**Ready for**: Onboarding endpoints, Post generation, All protected routes

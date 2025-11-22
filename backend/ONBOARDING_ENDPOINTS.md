# ✅ Onboarding API Endpoints - Complete

## Overview

Complete onboarding system implemented for Phase 1 MVP. Users can create, retrieve, and update their brand blueprint during and after onboarding.

---

## API Endpoints

### Base URL: `/api/v1/onboarding`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/brand-blueprint` | Create brand blueprint | ✅ (Mock) |
| GET | `/brand-blueprint` | Get user's blueprint | ✅ (Mock) |
| PUT | `/brand-blueprint` | Update blueprint | ✅ (Mock) |

---

## 1. Create Brand Blueprint

**POST** `/api/v1/onboarding/brand-blueprint`

Create a new brand blueprint during onboarding. Called once per user.

### Request Body

```json
{
  "topics": ["AI", "Leadership", "Innovation"],
  "goal": "Become a Top Voice",
  "tone": "Warm & Authentic",
  "posting_frequency": "2-3x/week",
  "preferred_days": ["Tue", "Thu", "Sat"],
  "best_time_to_post": "14:00:00",
  "ask_before_publish": true
}
```

### Response (201 Created)

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "topics": ["AI", "Leadership", "Innovation"],
    "goal": "Become a Top Voice",
    "tone": "Warm & Authentic",
    "posting_frequency": "2-3x/week",
    "preferred_days": ["Tue", "Thu", "Sat"],
    "best_time_to_post": "14:00:00",
    "ask_before_publish": true,
    "created_at": "2025-01-22T10:30:00Z",
    "updated_at": "2025-01-22T10:30:00Z"
  },
  "message": "Brand blueprint created successfully"
}
```

### Error Responses

**409 Conflict** - Blueprint already exists
```json
{
  "detail": "Brand blueprint already exists for this user. Use PUT to update."
}
```

**422 Unprocessable Entity** - Validation error
```json
{
  "detail": [
    {
      "loc": ["body", "topics"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## 2. Get Brand Blueprint

**GET** `/api/v1/onboarding/brand-blueprint`

Retrieve user's existing brand blueprint.

### Request

No body required. User ID from auth token.

### Response (200 OK)

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "topics": ["AI", "Leadership", "Innovation"],
    "goal": "Become a Top Voice",
    "tone": "Warm & Authentic",
    "posting_frequency": "2-3x/week",
    "preferred_days": ["Tue", "Thu", "Sat"],
    "best_time_to_post": "14:00:00",
    "ask_before_publish": true,
    "created_at": "2025-01-22T10:30:00Z",
    "updated_at": "2025-01-22T10:30:00Z"
  },
  "message": "Brand blueprint retrieved successfully"
}
```

### Error Responses

**404 Not Found** - Blueprint doesn't exist
```json
{
  "detail": "Brand blueprint not found. Please complete onboarding first."
}
```

---

## 3. Update Brand Blueprint

**PUT** `/api/v1/onboarding/brand-blueprint`

Update user's preferences. Supports partial updates.

### Request Body (Partial Update)

```json
{
  "tone": "Assertive & Bold",
  "posting_frequency": "5x/week",
  "preferred_days": ["Mon", "Wed", "Fri", "Sat", "Sun"]
}
```

All fields are optional. Only send fields you want to update.

### Response (200 OK)

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "topics": ["AI", "Leadership", "Innovation"],
    "goal": "Become a Top Voice",
    "tone": "Assertive & Bold",
    "posting_frequency": "5x/week",
    "preferred_days": ["Mon", "Wed", "Fri", "Sat", "Sun"],
    "best_time_to_post": "14:00:00",
    "ask_before_publish": true,
    "created_at": "2025-01-22T10:30:00Z",
    "updated_at": "2025-01-22T11:15:00Z"
  },
  "message": "Brand blueprint updated successfully"
}
```

### Error Responses

**404 Not Found** - Blueprint doesn't exist
```json
{
  "detail": "Brand blueprint not found. Create one first with POST."
}
```

---

## Testing (Phase 1 - Mock Auth)

### 1. Create Brand Blueprint

```bash
curl -X POST http://localhost:8000/api/v1/onboarding/brand-blueprint \
  -H "Content-Type: application/json" \
  -d '{
    "topics": ["AI", "Leadership"],
    "goal": "Become a Top Voice",
    "tone": "Warm & Authentic",
    "posting_frequency": "2-3x/week",
    "preferred_days": ["Tue", "Thu"],
    "ask_before_publish": true
  }'
```

### 2. Get Brand Blueprint

```bash
curl http://localhost:8000/api/v1/onboarding/brand-blueprint
```

### 3. Update Brand Blueprint

```bash
curl -X PUT http://localhost:8000/api/v1/onboarding/brand-blueprint \
  -H "Content-Type: application/json" \
  -d '{
    "tone": "Assertive & Bold",
    "posting_frequency": "5x/week"
  }'
```

---

## Implementation Details

### Architecture

```
Request
  ↓
Auth Middleware (get_current_user)
  ↓
Router (routers/onboarding.py)
  ↓
Service Layer (services/onboarding_service.py)
  ↓
Database (sparkle_brand_blueprints table)
```

### Database Schema

**Table**: `sparkle.sparkle_brand_blueprints`

**Constraints**:
- `user_id` UNIQUE (one blueprint per user)
- Foreign key to `sparkle_users(id)` CASCADE
- RLS: Users can only access their own blueprint

### Files Created/Modified

**Created (2 files):**
1. ✅ `services/onboarding_service.py` - Business logic
2. ✅ `routers/onboarding.py` - API endpoints

**Modified (4 files):**
1. ✅ `services/__init__.py` - Export onboarding functions
2. ✅ `routers/__init__.py` - Export onboarding router
3. ✅ `main.py` - Register onboarding router
4. ✅ `models/brand_blueprint.py` - Already had schemas (verified)

### Error Handling

| Error | Status Code | When |
|-------|-------------|------|
| Already exists | 409 Conflict | Create when blueprint exists |
| Not found | 404 Not Found | Get/Update when doesn't exist |
| Validation error | 422 Unprocessable | Invalid request data |
| Database error | 500 Internal | Database operation fails |

### Business Logic

**Create:**
1. Check if blueprint exists for user
2. If exists → HTTP 409 Conflict
3. Insert blueprint with user_id
4. Return created blueprint

**Get:**
1. Query by user_id
2. If not found → HTTP 404 Not Found
3. Return blueprint

**Update:**
1. Check if blueprint exists
2. If not found → HTTP 404 Not Found
3. Partial update (only provided fields)
4. Return updated blueprint

---

## Frontend Integration

### Onboarding Flow

```javascript
// Step 1: Create blueprint during onboarding
const response = await fetch('/api/v1/onboarding/brand-blueprint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topics: selectedTopics,
    goal: userGoal,
    tone: selectedTone,
    posting_frequency: frequency,
    preferred_days: days,
    ask_before_publish: true
  })
});

// Step 2: Check if user completed onboarding
const checkOnboarding = async () => {
  try {
    const response = await fetch('/api/v1/onboarding/brand-blueprint');
    return response.ok; // 200 = completed, 404 = not completed
  } catch {
    return false;
  }
};

// Step 3: Update preferences from settings
const updatePreferences = async (updates) => {
  await fetch('/api/v1/onboarding/brand-blueprint', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
};
```

---

## Validation Rules

### Required Fields (POST)

- ✅ `topics`: List of strings (at least 1)
- ✅ `goal`: String
- ✅ `tone`: String
- ✅ `posting_frequency`: String
- ✅ `preferred_days`: List of strings (at least 1)

### Optional Fields

- `best_time_to_post`: Time (HH:MM:SS format)
- `ask_before_publish`: Boolean (default: true)

### Update (PUT)

All fields optional. Only provided fields are updated.

---

## Next Steps

With onboarding complete, users can now:
1. ✅ Complete brand blueprint during onboarding
2. ✅ View their preferences in Profile tab
3. ✅ Update preferences anytime
4. ⏳ Generate posts aligned with their brand (next feature)

---

## API Documentation

View interactive docs at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Look for "Onboarding" tag in the API documentation.

---

**Status**: ✅ Onboarding Endpoints Complete
**Phase**: 1 (MVP)
**Next**: Post generation endpoints

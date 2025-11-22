# ✅ Posts API Endpoints - Complete

## Summary

Complete posts management system implemented with 7 RESTful endpoints. Users can create, list, view, edit, delete, schedule, and publish posts with full ownership verification and status management.

---

## API Endpoints

### Base URL: `/api/v1/posts`

| Method | Endpoint | Description | Auth | Status Codes |
|--------|----------|-------------|------|--------------|
| POST | `/posts` | Create new post | ✅ | 201, 422, 500 |
| GET | `/posts` | List user's posts | ✅ | 200, 500 |
| GET | `/posts/{id}` | Get specific post | ✅ | 200, 403, 404, 500 |
| PUT | `/posts/{id}` | Update post | ✅ | 200, 403, 404, 422, 500 |
| DELETE | `/posts/{id}` | Delete post | ✅ | 200, 403, 404, 500 |
| POST | `/posts/{id}/schedule` | Schedule post | ✅ | 200, 403, 404, 422, 500 |
| POST | `/posts/{id}/publish` | Publish post | ✅ | 200, 403, 404, 500 |

---

## Implementation Details

### Files Created/Modified

**Created (2 files):**
1. ✅ `services/post_service.py` - Business logic (7 functions + helper)
2. ✅ `routers/posts.py` - API endpoints (7 routes)

**Modified (5 files):**
1. ✅ `models/post.py` - Added PostSchedule, PostListResponse schemas
2. ✅ `services/__init__.py` - Export post functions
3. ✅ `routers/__init__.py` - Export posts router
4. ✅ `main.py` - Register posts router
5. ✅ `models/__init__.py` - Export new schemas (implicit)

---

## Endpoint Details

### 1. Create Post

**POST** `/api/v1/posts`

```bash
curl -X POST http://localhost:8000/api/v1/posts \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Just launched my new AI project! 🚀",
    "source_type": "manual",
    "hashtags": ["AI", "TechInnovation", "LinkedInPost"]
  }'
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": "post-uuid",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "content": "Just launched my new AI project! 🚀",
    "status": "draft",
    "source_type": "manual",
    "hashtags": ["AI", "TechInnovation", "LinkedInPost"],
    "scheduled_for": null,
    "published_at": null,
    "engagement_metrics": null,
    "created_at": "2025-01-22T10:00:00Z",
    "updated_at": "2025-01-22T10:00:00Z"
  },
  "message": "Post created successfully"
}
```

---

### 2. List Posts

**GET** `/api/v1/posts?status=draft&limit=20`

**Query Parameters:**
- `status` (optional): draft | scheduled | published
- `limit` (optional): 1-100 (default: 50)

```bash
# All posts
curl http://localhost:8000/api/v1/posts

# Only drafts
curl http://localhost:8000/api/v1/posts?status=draft

# Scheduled posts, max 10
curl http://localhost:8000/api/v1/posts?status=scheduled&limit=10
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "posts": [...],
    "count": 15,
    "filter": "draft"
  },
  "message": "Posts retrieved successfully"
}
```

---

### 3. Get Single Post

**GET** `/api/v1/posts/{post_id}`

```bash
curl http://localhost:8000/api/v1/posts/{post_id}
```

**Responses:**
- **200** - Success
- **403** - User doesn't own the post
- **404** - Post not found

---

### 4. Update Post

**PUT** `/api/v1/posts/{post_id}`

Update content and hashtags only. Status changes via /schedule or /publish.

```bash
curl -X PUT http://localhost:8000/api/v1/posts/{post_id} \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated post content!",
    "hashtags": ["NewTag", "Updated"]
  }'
```

---

### 5. Delete Post

**DELETE** `/api/v1/posts/{post_id}`

```bash
curl -X DELETE http://localhost:8000/api/v1/posts/{post_id}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "deleted": true,
    "post_id": "post-uuid"
  },
  "message": "Post deleted successfully"
}
```

---

### 6. Schedule Post

**POST** `/api/v1/posts/{post_id}/schedule`

```bash
curl -X POST http://localhost:8000/api/v1/posts/{post_id}/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "scheduled_for": "2025-01-25T14:00:00Z"
  }'
```

**Validation:**
- `scheduled_for` must be in the future
- Changes status to "scheduled"

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "post-uuid",
    "status": "scheduled",
    "scheduled_for": "2025-01-25T14:00:00Z",
    ...
  },
  "message": "Post scheduled successfully"
}
```

---

### 7. Publish Post

**POST** `/api/v1/posts/{post_id}/publish`

```bash
curl -X POST http://localhost:8000/api/v1/posts/{post_id}/publish
```

**Phase 1**: Marks as published, sets timestamp
**Phase 2**: Will integrate LinkedIn API for actual posting

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "post-uuid",
    "status": "published",
    "published_at": "2025-01-22T10:05:00Z",
    ...
  },
  "message": "Post published successfully"
}
```

---

## Status Transitions

```
draft → scheduled (POST /schedule)
draft → published (POST /publish)
scheduled → published (POST /publish)
```

**Business Rules:**
- All new posts start as "draft"
- Can edit drafts and scheduled posts
- Cannot edit published posts (Phase 1)
- Can delete any status

---

## Security & Ownership

Every endpoint that accesses a specific post verifies ownership:

```python
async def _verify_post_ownership(user_id, post_id):
    - Check post exists → 404 if not
    - Check user owns it → 403 if not
    - Return post data
```

**RLS Policy**: Users can only access their own posts via `user_id` match.

---

## Error Handling

| Error | HTTP Status | When |
|-------|-------------|------|
| Post not found | 404 Not Found | Post ID doesn't exist |
| Wrong user | 403 Forbidden | User doesn't own post |
| No fields to update | 422 Unprocessable | Empty PUT request |
| Past schedule time | 422 Unprocessable | scheduled_for in the past |
| Validation error | 422 Unprocessable | Invalid Pydantic data |
| Database error | 500 Internal | DB operation fails |

---

## Database Schema

**Table**: `sparkle.sparkle_posts`

**Key Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK to sparkle_users)
- `content` (TEXT) - Post text
- `status` (TEXT) - draft/scheduled/published
- `source_type` (TEXT) - ai_generated/manual/trending_news
- `hashtags` (TEXT[]) - Array of hashtags
- `scheduled_for` (TIMESTAMP) - When to publish
- `published_at` (TIMESTAMP) - When published
- `engagement_metrics` (JSONB) - {views, likes, comments, shares}
- `created_at`, `updated_at` (TIMESTAMP)

---

## Service Layer Functions

### Core Operations
1. `create_post(user_id, data)` - Insert with status="draft"
2. `get_posts(user_id, status, limit)` - Query with filters
3. `get_post_by_id(user_id, post_id)` - Single post + ownership check
4. `update_post(user_id, post_id, data)` - Update content/hashtags
5. `delete_post(user_id, post_id)` - Delete post
6. `schedule_post(user_id, post_id, scheduled_for)` - Set schedule
7. `publish_post(user_id, post_id)` - Mark published

### Helper
- `_verify_post_ownership(user_id, post_id)` - DRY ownership verification

---

## Phase 1 vs Phase 2

### Phase 1 (Current)
✅ Create/Read/Update/Delete posts
✅ Schedule for future
✅ Mark as published
✅ Manual LinkedIn posting (clipboard)
❌ No AI generation yet
❌ No actual LinkedIn API integration
❌ No engagement metrics

### Phase 2 (Future)
- LinkedIn OAuth integration
- Auto-publish via LinkedIn API
- Fetch real engagement data
- AI post generation (next feature)
- Image generation for posts
- Scheduled job notifications

---

## Testing Examples

```bash
# 1. Create a post
POST_ID=$(curl -X POST http://localhost:8000/api/v1/posts \
  -H "Content-Type: application/json" \
  -d '{"content":"Test post","source_type":"manual","hashtags":["Test"]}' \
  | jq -r '.data.id')

# 2. List all drafts
curl http://localhost:8000/api/v1/posts?status=draft

# 3. Edit the post
curl -X PUT http://localhost:8000/api/v1/posts/$POST_ID \
  -H "Content-Type: application/json" \
  -d '{"content":"Updated content"}'

# 4. Schedule it
curl -X POST http://localhost:8000/api/v1/posts/$POST_ID/schedule \
  -H "Content-Type: application/json" \
  -d '{"scheduled_for":"2025-01-25T14:00:00Z"}'

# 5. Publish it
curl -X POST http://localhost:8000/api/v1/posts/$POST_ID/publish

# 6. Delete it
curl -X DELETE http://localhost:8000/api/v1/posts/$POST_ID
```

---

## Integration with Other Features

### Onboarding
- Brand blueprint influences post tone (Phase 1.2 - AI generation)
- Posting frequency guides scheduling suggestions

### Analytics (Phase 2)
- `engagement_metrics` populated from LinkedIn API
- Track performance per post

### AI Generation (Next)
- POST /posts/generate endpoint
- Uses brand blueprint for voice matching
- Leverages RAG for context

---

## API Documentation

View interactive docs:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Look for **"Posts"** tag in the sidebar.

---

**Status**: ✅ Posts API Complete
**Endpoints**: 7/7 Implemented
**Phase**: 1 (MVP)
**Next**: AI Post Generation

from fastapi import APIRouter, Depends, HTTPException, status, Query
from middleware.auth_middleware import get_current_user
from services.post_service import (
    create_post,
    get_posts,
    get_post_by_id,
    update_post,
    delete_post,
    schedule_post,
    publish_post
)
from models.post import (
    PostCreate,
    PostUpdate,
    PostSchedule,
    PostResponse,
    PostStatus
)
from typing import Dict, Any, Optional

router = APIRouter(prefix="/posts", tags=["Posts"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_new_post(
    post: PostCreate,
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Create a new post.

    Posts can be created:
    - **Manually** by the user (source_type: "manual")
    - **From AI generation** (source_type: "ai_generated") - Phase 1.2
    - **From trending news** (source_type: "trending_news") - Phase 1.2

    All new posts start with status = "draft".

    **Phase 1**: Uses mock authentication (no token required)

    **Returns**: Created post with ID and timestamps
    """
    user_id = current_user.get("id")
    result = await create_post(user_id, post)

    return {
        "status": "success",
        "data": result,
        "message": "Post created successfully"
    }


@router.get("", response_model=Dict[str, Any])
async def list_posts(
    status_filter: Optional[str] = Query(None, description="Filter by status: draft, scheduled, or published"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of posts to return"),
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get all posts for the current user.

    **Query Parameters:**
    - `status_filter`: Filter by post status (draft/scheduled/published)
    - `limit`: Maximum number of posts (1-100, default 50)

    **Examples:**
    - `/posts` - Get all posts
    - `/posts?status_filter=draft` - Get only drafts
    - `/posts?status_filter=scheduled&limit=10` - Get 10 scheduled posts

    **Phase 1**: Uses mock authentication (no token required)

    **Returns**: List of posts with count
    """
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"📋 GET /posts - status_filter={status_filter}, limit={limit}")

    user_id = current_user.get("id")
    result = await get_posts(user_id, status_filter, limit)

    return {
        "status": "success",
        "data": result,
        "message": "Posts retrieved successfully"
    }


@router.get("/{post_id}", response_model=Dict[str, Any])
async def get_post(
    post_id: str,
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get a specific post by ID.

    **Security**: Users can only access their own posts.

    **Phase 1**: Uses mock authentication (no token required)

    **Returns**: Post data or 404 if not found
    """
    user_id = current_user.get("id")
    result = await get_post_by_id(user_id, post_id)

    return {
        "status": "success",
        "data": result,
        "message": "Post retrieved successfully"
    }


@router.put("/{post_id}", response_model=Dict[str, Any])
async def edit_post(
    post_id: str,
    post: PostUpdate,
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Update post content and hashtags.

    **Allowed updates:**
    - Content (post text)
    - Hashtags

    **Not allowed here:**
    - Status changes (use /schedule or /publish endpoints)

    **Security**: Users can only edit their own posts.

    **Phase 1**: Uses mock authentication (no token required)

    **Returns**: Updated post
    """
    user_id = current_user.get("id")
    result = await update_post(user_id, post_id, post)

    return {
        "status": "success",
        "data": result,
        "message": "Post updated successfully"
    }


@router.delete("/{post_id}", status_code=status.HTTP_200_OK)
async def discard_post(
    post_id: str,
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Delete/discard a post.

    Can delete posts in any status (draft, scheduled, published).

    **Security**: Users can only delete their own posts.

    **Phase 1**: Uses mock authentication (no token required)

    **Returns**: Success confirmation
    """
    user_id = current_user.get("id")
    result = await delete_post(user_id, post_id)

    return {
        "status": "success",
        "data": result,
        "message": "Post deleted successfully"
    }


@router.post("/{post_id}/schedule", response_model=Dict[str, Any])
async def schedule_post_for_publication(
    post_id: str,
    schedule_data: PostSchedule,
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Schedule a post for future publication.

    Changes post status to "scheduled" and sets the scheduled_for timestamp.

    **Phase 1**: Records schedule time. Notifications will be added later.
    **Phase 2**: Will trigger actual LinkedIn posting at scheduled time.

    **Validation:**
    - scheduled_for must be in the future

    **Security**: Users can only schedule their own posts.

    **Returns**: Updated post with scheduled status
    """
    user_id = current_user.get("id")
    result = await schedule_post(user_id, post_id, schedule_data.scheduled_for)

    return {
        "status": "success",
        "data": result,
        "message": "Post scheduled successfully"
    }


@router.post("/{post_id}/publish", response_model=Dict[str, Any])
async def publish_post_now(
    post_id: str,
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Mark a post as published.

    **Phase 1**:
    - Sets status to "published"
    - Records published_at timestamp
    - User copies to clipboard and shares on LinkedIn manually

    **Phase 2**:
    - Will integrate with LinkedIn API for automatic posting
    - Will fetch real engagement metrics

    **Security**: Users can only publish their own posts.

    **Returns**: Updated post with published status
    """
    user_id = current_user.get("id")
    result = await publish_post(user_id, post_id)

    return {
        "status": "success",
        "data": result,
        "message": "Post published successfully"
    }

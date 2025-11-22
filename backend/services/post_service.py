from fastapi import HTTPException, status
from database import supabase
from models.post import PostCreate, PostUpdate, PostStatus
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


async def _verify_post_ownership(user_id: str, post_id: str) -> Dict[str, Any]:
    """
    Verify that a post exists and belongs to the user.

    Args:
        user_id: User's UUID
        post_id: Post's UUID

    Returns:
        Post data if ownership verified

    Raises:
        HTTPException 404: If post not found
        HTTPException 403: If user doesn't own the post
    """
    try:
        result = supabase.table("sparkle_posts").select("*").eq("id", post_id).execute()

        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )

        post = result.data[0]

        if post["user_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to access this post"
            )

        return post

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error verifying post ownership: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error verifying post: {str(e)}"
        )


async def create_post(user_id: str, data: PostCreate) -> Dict[str, Any]:
    """
    Create a new post for the user.

    Args:
        user_id: User's UUID
        data: Post data from request

    Returns:
        Created post

    Raises:
        HTTPException 500: If database error occurs
    """
    try:
        post_data = data.model_dump()
        post_data["user_id"] = user_id
        post_data["status"] = PostStatus.DRAFT.value  # New posts start as draft

        result = supabase.table("sparkle_posts").insert(post_data).execute()

        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create post"
            )

        logger.info(f"✅ Created post {result.data[0]['id']} for user {user_id}")
        return result.data[0]

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error creating post: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


async def get_posts(
    user_id: str,
    status_filter: Optional[str] = None,
    limit: int = 50
) -> Dict[str, Any]:
    """
    Get user's posts with optional status filter.

    Args:
        user_id: User's UUID
        status_filter: Optional status filter (draft/scheduled/published)
        limit: Maximum number of posts to return

    Returns:
        Dictionary with posts list, count, and filter

    Raises:
        HTTPException 500: If database error occurs
    """
    try:
        query = supabase.table("sparkle_posts").select("*").eq("user_id", user_id)

        # Apply status filter if provided
        if status_filter:
            query = query.eq("status", status_filter)

        # Order by created_at descending and limit
        result = query.order("created_at", desc=True).limit(limit).execute()

        posts = result.data if result.data else []

        return {
            "posts": posts,
            "count": len(posts),
            "filter": status_filter
        }

    except Exception as e:
        logger.error(f"❌ Error getting posts: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


async def get_post_by_id(user_id: str, post_id: str) -> Dict[str, Any]:
    """
    Get a specific post by ID.

    Args:
        user_id: User's UUID
        post_id: Post's UUID

    Returns:
        Post data

    Raises:
        HTTPException 403: If user doesn't own the post
        HTTPException 404: If post not found
        HTTPException 500: If database error occurs
    """
    post = await _verify_post_ownership(user_id, post_id)
    return post


async def update_post(user_id: str, post_id: str, data: PostUpdate) -> Dict[str, Any]:
    """
    Update post content and hashtags.

    Note: Status changes are handled by separate endpoints (schedule/publish).

    Args:
        user_id: User's UUID
        post_id: Post's UUID
        data: Fields to update

    Returns:
        Updated post

    Raises:
        HTTPException 403: If user doesn't own the post
        HTTPException 404: If post not found
        HTTPException 500: If database error occurs
    """
    try:
        # Verify ownership
        await _verify_post_ownership(user_id, post_id)

        # Only include fields that are provided
        update_data = data.model_dump(exclude_unset=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No fields to update"
            )

        # Update the post
        result = supabase.table("sparkle_posts").update(update_data).eq("id", post_id).execute()

        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update post"
            )

        logger.info(f"✅ Updated post {post_id}")
        return result.data[0]

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error updating post: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


async def delete_post(user_id: str, post_id: str) -> Dict[str, Any]:
    """
    Delete a post.

    Args:
        user_id: User's UUID
        post_id: Post's UUID

    Returns:
        Success message

    Raises:
        HTTPException 403: If user doesn't own the post
        HTTPException 404: If post not found
        HTTPException 500: If database error occurs
    """
    try:
        # Verify ownership
        await _verify_post_ownership(user_id, post_id)

        # Delete the post
        result = supabase.table("sparkle_posts").delete().eq("id", post_id).execute()

        logger.info(f"✅ Deleted post {post_id}")
        return {"deleted": True, "post_id": post_id}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error deleting post: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


async def schedule_post(user_id: str, post_id: str, scheduled_for: datetime) -> Dict[str, Any]:
    """
    Schedule a post for future publication.

    Args:
        user_id: User's UUID
        post_id: Post's UUID
        scheduled_for: Datetime when post should be published

    Returns:
        Updated post with scheduled status

    Raises:
        HTTPException 403: If user doesn't own the post
        HTTPException 404: If post not found
        HTTPException 422: If scheduled_for is in the past
        HTTPException 500: If database error occurs
    """
    try:
        # Verify ownership
        await _verify_post_ownership(user_id, post_id)

        # Validate scheduled_for is in the future
        if scheduled_for <= datetime.now():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Scheduled time must be in the future"
            )

        # Update post status and scheduled_for
        update_data = {
            "status": PostStatus.SCHEDULED.value,
            "scheduled_for": scheduled_for.isoformat()
        }

        result = supabase.table("sparkle_posts").update(update_data).eq("id", post_id).execute()

        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to schedule post"
            )

        logger.info(f"✅ Scheduled post {post_id} for {scheduled_for}")
        return result.data[0]

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error scheduling post: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


async def publish_post(user_id: str, post_id: str) -> Dict[str, Any]:
    """
    Mark a post as published.

    Phase 1: Sets status to published and records timestamp.
    Phase 2: Will integrate with LinkedIn API for actual publishing.

    Args:
        user_id: User's UUID
        post_id: Post's UUID

    Returns:
        Updated post with published status

    Raises:
        HTTPException 403: If user doesn't own the post
        HTTPException 404: If post not found
        HTTPException 500: If database error occurs
    """
    try:
        # Verify ownership
        await _verify_post_ownership(user_id, post_id)

        # Update post status and published_at
        update_data = {
            "status": PostStatus.PUBLISHED.value,
            "published_at": datetime.now().isoformat()
        }

        result = supabase.table("sparkle_posts").update(update_data).eq("id", post_id).execute()

        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to publish post"
            )

        logger.info(f"✅ Published post {post_id}")
        return result.data[0]

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error publishing post: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
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
from services.ai.generation_service import get_generation_service
from services.ai.image_service import get_image_service
from services.storage_service import get_storage_service
from models.post import (
    PostCreate,
    PostUpdate,
    PostSchedule,
    PostResponse,
    PostStatus
)
from models.ai import AIAssistRequest, AIAssistResponse
from models.image import ImageGenerateRequest
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


@router.post("/upload-image", response_model=Dict[str, Any])
async def upload_post_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Upload an image for a post.

    **File Requirements:**
    - Max size: 2MB
    - Allowed formats: JPG, PNG
    - Content type: image/jpeg or image/png

    **Returns:**
    - `image_url`: Public URL of uploaded image

    **Phase 1**: Uses Supabase Storage

    **Example Response:**
    ```json
    {
        "status": "success",
        "data": {
            "image_url": "https://...supabase.co/storage/v1/object/public/post-images/..."
        },
        "message": "Image uploaded successfully"
    }
    ```
    """
    user_id = current_user.get("id")
    storage_service = get_storage_service()

    try:
        image_url = await storage_service.upload_image(file, user_id)

        return {
            "status": "success",
            "data": {"image_url": image_url},
            "message": "Image uploaded successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image upload failed: {str(e)}"
        )


@router.post("/ai-assist", response_model=Dict[str, Any])
async def ai_assist(
    request: AIAssistRequest,
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get AI assistance for content generation and improvement.

    **Supported Actions:**
    - `continue`: Continue writing from current text
    - `rephrase`: Rewrite text with different words
    - `grammar`: Fix spelling and grammar errors
    - `engagement`: Make content more compelling
    - `shorter`: Condense text while keeping core message

    **All responses include:**
    - `content`: Generated/improved text
    - `hashtags`: 3-5 relevant hashtags
    - `hook_suggestion`: Alternative opening line

    **AI Generation:**
    - Uses user's brand blueprint (tone, topics, goal) for personalization
    - Follows LinkedIn best practices
    - Supports OpenAI GPT-4 and Anthropic Claude

    **Phase 1**: Uses mock authentication (no token required)

    **Example Request:**
    ```json
    {
        "action": "continue",
        "text": "Leadership is about making tough decisions"
    }
    ```

    **Example Response:**
    ```json
    {
        "status": "success",
        "data": {
            "content": "Leadership is about making tough decisions. But the best leaders...",
            "hashtags": ["Leadership", "DecisionMaking", "GrowthMindset"],
            "hook_suggestion": "The hardest lesson I learned about leadership? Admitting when I was wrong."
        },
        "message": "Content generated successfully"
    }
    ```

    **Returns**: Generated content with hashtags and hook suggestion
    """
    user_id = current_user.get("id")
    generation_service = get_generation_service()

    try:
        # Route to appropriate action handler
        if request.action == "continue":
            result = await generation_service.continue_writing(user_id, request.text)
        elif request.action == "rephrase":
            result = await generation_service.rephrase(user_id, request.text)
        elif request.action == "grammar":
            result = await generation_service.correct_grammar(user_id, request.text)
        elif request.action == "engagement":
            result = await generation_service.improve_engagement(user_id, request.text)
        elif request.action == "shorter":
            result = await generation_service.make_shorter(user_id, request.text)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unknown action: {request.action}"
            )

        return {
            "status": "success",
            "data": result,
            "message": "Content generated successfully"
        }

    except HTTPException:
        raise
    except ValueError as e:
        # Configuration errors (missing API key, invalid provider, etc.)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        # Unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )


@router.post("/generate-ai-image", response_model=Dict[str, Any])
async def generate_ai_image(
    request: ImageGenerateRequest,
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Generate an image using AI (DALL-E 3) based on post content.

    **Request Body:**
    - `post_text`: Post content to generate image from (required for post_content source)
    - `source`: Generation source (post_content or custom_description)
    - `custom_prompt`: Custom image description (required for custom_description source)

    **Phase 1**: "post_content" source - generate from post text
    **Phase 2**: "custom_description" source - generate from custom prompt

    **Process:**
    1. Validate input based on source
    2. Generate DALL-E 3 image
    3. Download generated image
    4. Upload to Supabase Storage (sparkle_pic bucket)
    5. Return public URL

    **Returns:**
    ```json
    {
        "status": "success",
        "data": {
            "image_url": "https://...supabase.co/storage/v1/object/public/sparkle_pic/..."
        },
        "message": "AI image generated successfully"
    }
    ```

    **Errors:**
    - 400: Invalid input (empty text, too short/long, missing fields)
    - 503: DALL-E API unavailable or API key not configured
    - 500: Image generation or upload failed

    **Example Requests:**
    ```json
    // From post content
    {
        "post_text": "Just launched my new AI-powered productivity app...",
        "source": "post_content"
    }

    // From custom prompt
    {
        "custom_prompt": "A futuristic robot shaking hands with a human in modern office",
        "source": "custom_description"
    }
    ```
    """
    user_id = current_user.get("id")
    image_service = get_image_service()

    try:
        # Route based on source type
        if request.source == "post_content":
            # Generate from post content
            image_url = await image_service.generate_from_post_content(
                request.post_text,
                user_id
            )
        elif request.source == "custom_description":
            # Generate from custom prompt
            if not request.custom_prompt:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="custom_prompt is required when source is 'custom_description'"
                )
            image_url = await image_service.generate_from_custom_prompt(
                request.custom_prompt,
                user_id
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid source: {request.source}. Must be 'post_content' or 'custom_description'"
            )

        return {
            "status": "success",
            "data": {"image_url": image_url},
            "message": "AI image generated successfully"
        }

    except HTTPException:
        raise
    except ValueError as e:
        # Configuration errors (missing API key, etc.)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        # Unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI image generation error: {str(e)}"
        )

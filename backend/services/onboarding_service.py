from fastapi import HTTPException, status
from database import supabase
from models.brand_blueprint import BrandBlueprintCreate, BrandBlueprintUpdate
from config.settings import settings
from typing import Dict, Any
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# ==============================================================================
# MOCK DATA STORAGE (Phase 1 MVP)
# ==============================================================================
# In-memory storage for brand blueprints during Phase 1
# This will be replaced with actual database operations in Phase 2
MOCK_BLUEPRINTS: Dict[str, Dict[str, Any]] = {}


async def create_brand_blueprint(user_id: str, data: BrandBlueprintCreate) -> Dict[str, Any]:
    """
    Create a new brand blueprint for a user during onboarding.

    Args:
        user_id: User's UUID
        data: Brand blueprint data from request

    Returns:
        Created brand blueprint

    Raises:
        HTTPException 409: If blueprint already exists for user
        HTTPException 500: If database error occurs
    """
    # ==============================================================================
    # PHASE 1: Mock Mode (No database)
    # ==============================================================================
    if settings.USE_MOCK_AUTH:
        # Check if blueprint already exists in mock storage
        if user_id in MOCK_BLUEPRINTS:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Brand blueprint already exists for this user. Use PUT to update."
            )

        # Create mock blueprint
        blueprint_dict = data.model_dump()
        mock_blueprint = {
            "id": "blueprint_123",
            "user_id": user_id,
            **blueprint_dict,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "updated_at": datetime.utcnow().isoformat() + "Z",
        }

        # Store in mock storage
        MOCK_BLUEPRINTS[user_id] = mock_blueprint
        logger.info(f"✅ Created mock brand blueprint for user {user_id}")
        return mock_blueprint

    # ==============================================================================
    # PHASE 2: Real Database (Currently disabled)
    # ==============================================================================
    try:
        # Check if blueprint already exists
        existing = supabase.table("sparkle_brand_blueprints").select("id").eq("user_id", user_id).execute()

        if existing.data and len(existing.data) > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Brand blueprint already exists for this user. Use PUT to update."
            )

        # Convert time object to string for database storage
        blueprint_data = data.model_dump()
        if blueprint_data.get("best_time_to_post"):
            blueprint_data["best_time_to_post"] = str(blueprint_data["best_time_to_post"])

        # Add user_id to the data
        blueprint_data["user_id"] = user_id

        # Insert brand blueprint
        result = supabase.table("sparkle_brand_blueprints").insert(blueprint_data).execute()

        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create brand blueprint"
            )

        logger.info(f"✅ Created brand blueprint for user {user_id}")
        return result.data[0]

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error creating brand blueprint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


async def get_brand_blueprint(user_id: str) -> Dict[str, Any]:
    """
    Get user's brand blueprint.

    Args:
        user_id: User's UUID

    Returns:
        Brand blueprint data

    Raises:
        HTTPException 404: If blueprint not found
        HTTPException 500: If database error occurs
    """
    # ==============================================================================
    # PHASE 1: Mock Mode (No database)
    # ==============================================================================
    if settings.USE_MOCK_AUTH:
        if user_id not in MOCK_BLUEPRINTS:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Brand blueprint not found. Please complete onboarding first."
            )
        return MOCK_BLUEPRINTS[user_id]

    # ==============================================================================
    # PHASE 2: Real Database (Currently disabled)
    # ==============================================================================
    try:
        result = supabase.table("sparkle_brand_blueprints").select("*").eq("user_id", user_id).execute()

        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Brand blueprint not found. Please complete onboarding first."
            )

        return result.data[0]

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting brand blueprint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


async def update_brand_blueprint(user_id: str, data: BrandBlueprintUpdate) -> Dict[str, Any]:
    """
    Update user's brand blueprint (partial update).

    Args:
        user_id: User's UUID
        data: Fields to update

    Returns:
        Updated brand blueprint

    Raises:
        HTTPException 404: If blueprint not found
        HTTPException 500: If database error occurs
    """
    # ==============================================================================
    # PHASE 1: Mock Mode (No database)
    # ==============================================================================
    if settings.USE_MOCK_AUTH:
        if user_id not in MOCK_BLUEPRINTS:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Brand blueprint not found. Create one first with POST."
            )

        # Get existing blueprint
        existing_blueprint = MOCK_BLUEPRINTS[user_id]

        # Only include fields that are provided
        update_data = data.model_dump(exclude_unset=True)

        # Update fields
        updated_blueprint = {
            **existing_blueprint,
            **update_data,
            "updated_at": datetime.utcnow().isoformat() + "Z",
        }

        # Store updated blueprint
        MOCK_BLUEPRINTS[user_id] = updated_blueprint
        logger.info(f"✅ Updated mock brand blueprint for user {user_id}")
        return updated_blueprint

    # ==============================================================================
    # PHASE 2: Real Database (Currently disabled)
    # ==============================================================================
    try:
        # Check if blueprint exists
        existing = supabase.table("sparkle_brand_blueprints").select("id").eq("user_id", user_id).execute()

        if not existing.data or len(existing.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Brand blueprint not found. Create one first with POST."
            )

        # Only include fields that are provided (exclude None values)
        update_data = data.model_dump(exclude_unset=True)

        # Convert time object to string if present
        if "best_time_to_post" in update_data and update_data["best_time_to_post"]:
            update_data["best_time_to_post"] = str(update_data["best_time_to_post"])

        # Update the blueprint
        result = supabase.table("sparkle_brand_blueprints").update(update_data).eq("user_id", user_id).execute()

        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update brand blueprint"
            )

        logger.info(f"✅ Updated brand blueprint for user {user_id}")
        return result.data[0]

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error updating brand blueprint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

from fastapi import HTTPException, status
from database import supabase
from models.brand_blueprint import BrandBlueprintCreate, BrandBlueprintUpdate
from config.settings import settings
from typing import Dict, Any
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


def _parse_posting_frequency(frequency_str: str) -> int:
    """Parse posting frequency string to posts per week integer"""
    if not frequency_str:
        return 3

    frequency_lower = frequency_str.lower()
    if "every day" in frequency_lower or "daily" in frequency_lower:
        return 7
    elif "1x" in frequency_lower or "once" in frequency_lower:
        return 1
    elif "2" in frequency_lower:
        return 2
    elif "3" in frequency_lower:
        return 3
    else:
        # Try to extract number
        import re
        match = re.search(r'(\d+)', frequency_str)
        return int(match.group(1)) if match else 3


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
    # REAL DATABASE MODE (Always enabled for onboarding data)
    # ==============================================================================
    # Note: We use real database for onboarding even with mock auth
    # This allows testing database integration while using simple mock auth
    try:
        # Check if blueprint already exists
        existing = supabase.table("sparkle_brand_blueprints").select("id").eq("user_id", user_id).execute()

        if existing.data and len(existing.data) > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Brand blueprint already exists for this user. Use PUT to update."
            )

        # Map our model fields to database column names
        posting_prefs = data.posting_preferences

        # Calculate posting_frequency from posts_per_week
        posts_per_week = posting_prefs.posts_per_week
        if posts_per_week == 1:
            posting_frequency = "1x/week"
        elif posts_per_week <= 3:
            posting_frequency = f"{posts_per_week}x/week"
        elif posts_per_week == 7:
            posting_frequency = "Every day"
        else:
            posting_frequency = f"{posts_per_week}x/week"

        # Convert preferred_hours list to TIME (take first hour)
        best_time = None
        if posting_prefs.preferred_hours and len(posting_prefs.preferred_hours) > 0:
            hour = posting_prefs.preferred_hours[0]
            best_time = f"{hour:02d}:00:00"  # Format as HH:MM:SS

        blueprint_data = {
            "user_id": user_id,
            "topics": data.topics,
            "goal": data.main_goal,  # Map main_goal -> goal
            "inspiration_sources": data.inspirations,  # Map inspirations -> inspiration_sources
            "tone": data.tone,
            "posting_frequency": posting_frequency,
            "preferred_days": posting_prefs.preferred_days,
            "best_time_to_post": best_time,
            "ask_before_publish": posting_prefs.ask_before_publish,
        }

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
    # REAL DATABASE MODE (Always enabled for onboarding data)
    # ==============================================================================
    try:
        result = supabase.table("sparkle_brand_blueprints").select("*").eq("user_id", user_id).execute()

        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Brand blueprint not found. Please complete onboarding first."
            )

        # Map database columns back to our API model
        blueprint = result.data[0]

        # Convert database format to API format
        mapped_blueprint = {
            "id": blueprint.get("id"),
            "user_id": blueprint.get("user_id"),
            "topics": blueprint.get("topics", []),
            "main_goal": blueprint.get("goal"),  # Map goal -> main_goal
            "inspirations": blueprint.get("inspiration_sources", []),  # Map inspiration_sources -> inspirations
            "tone": blueprint.get("tone"),
            "posting_preferences": {
                "preferred_days": blueprint.get("preferred_days", []),
                "preferred_hours": [int(blueprint.get("best_time_to_post", "14:00:00").split(":")[0])] if blueprint.get("best_time_to_post") else [14],
                "posts_per_week": _parse_posting_frequency(blueprint.get("posting_frequency", "3x/week")),
                "ask_before_publish": blueprint.get("ask_before_publish", True),
            },
            "created_at": blueprint.get("created_at"),
            "updated_at": blueprint.get("updated_at"),
        }

        return mapped_blueprint

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
    # REAL DATABASE MODE (Always enabled for onboarding data)
    # ==============================================================================
    # Note: We use real database for onboarding even with mock auth
    # This allows testing database integration while using simple mock auth
    try:
        # Check if blueprint exists
        existing = supabase.table("sparkle_brand_blueprints").select("id").eq("user_id", user_id).execute()

        if not existing.data or len(existing.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Brand blueprint not found. Create one first with POST."
            )

        # Build update data with field mapping
        update_data = {}

        # Map API fields to database columns
        if data.topics is not None:
            update_data["topics"] = data.topics
        if data.main_goal is not None:
            update_data["goal"] = data.main_goal
        if data.inspirations is not None:
            update_data["inspiration_sources"] = data.inspirations
        if data.tone is not None:
            update_data["tone"] = data.tone

        # Handle posting preferences
        if data.posting_preferences is not None:
            prefs = data.posting_preferences

            # Convert posts_per_week to frequency string
            if prefs.posts_per_week == 1:
                update_data["posting_frequency"] = "1x/week"
            elif prefs.posts_per_week <= 3:
                update_data["posting_frequency"] = f"{prefs.posts_per_week}x/week"
            elif prefs.posts_per_week == 7:
                update_data["posting_frequency"] = "Every day"
            else:
                update_data["posting_frequency"] = f"{prefs.posts_per_week}x/week"

            # Update other posting preferences
            if prefs.preferred_days:
                update_data["preferred_days"] = prefs.preferred_days
            if prefs.preferred_hours and len(prefs.preferred_hours) > 0:
                hour = prefs.preferred_hours[0]
                update_data["best_time_to_post"] = f"{hour:02d}:00:00"
            if prefs.ask_before_publish is not None:
                update_data["ask_before_publish"] = prefs.ask_before_publish

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

from fastapi import APIRouter, Depends, HTTPException, status
from middleware.auth_middleware import get_current_user
from services.onboarding_service import (
    create_brand_blueprint,
    get_brand_blueprint,
    update_brand_blueprint
)
from models.brand_blueprint import (
    BrandBlueprintCreate,
    BrandBlueprintUpdate,
    BrandBlueprintResponse
)
from typing import Dict, Any

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])


@router.post("/brand-blueprint", status_code=status.HTTP_201_CREATED)
async def create_user_brand_blueprint(
    blueprint: BrandBlueprintCreate,
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Create brand blueprint during onboarding.

    This endpoint is called during the onboarding flow to save user preferences:
    - Topics of interest (e.g., AI, Leadership, Finance)
    - Main goal (e.g., Become a Top Voice)
    - Tone preference (e.g., Warm & Authentic)
    - Posting frequency and schedule preferences

    **Phase 1**: Uses mock authentication (no token required)

    **Returns**: Created brand blueprint with ID and timestamps
    """
    user_id = current_user.get("id")

    result = await create_brand_blueprint(user_id, blueprint)

    return {
        "status": "success",
        "data": result,
        "message": "Brand blueprint created successfully"
    }


@router.get("/brand-blueprint", response_model=Dict[str, Any])
async def get_user_brand_blueprint(
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get user's existing brand blueprint.

    Retrieves the user's onboarding preferences and brand settings.
    Used to:
    - Check if user has completed onboarding
    - Display current preferences in Profile/Settings
    - Generate posts aligned with user's brand

    **Phase 1**: Uses mock authentication (no token required)

    **Returns**: User's brand blueprint or 404 if not found
    """
    user_id = current_user.get("id")

    result = await get_brand_blueprint(user_id)

    return {
        "status": "success",
        "data": result,
        "message": "Brand blueprint retrieved successfully"
    }


@router.put("/brand-blueprint", response_model=Dict[str, Any])
async def update_user_brand_blueprint(
    blueprint: BrandBlueprintUpdate,
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Update user's brand blueprint.

    Allows users to modify their preferences after onboarding.
    Supports partial updates - only send fields you want to change.

    **Example**: Update only tone and posting frequency
    ```json
    {
      "tone": "Assertive & Bold",
      "posting_frequency": "5x/week"
    }
    ```

    **Phase 1**: Uses mock authentication (no token required)

    **Returns**: Updated brand blueprint
    """
    user_id = current_user.get("id")

    result = await update_brand_blueprint(user_id, blueprint)

    return {
        "status": "success",
        "data": result,
        "message": "Brand blueprint updated successfully"
    }

from fastapi import APIRouter, Depends, HTTPException, status
from middleware.auth_middleware import get_current_user
from database import supabase
from models.user import UserResponse
from typing import Dict, Any

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/me", response_model=Dict[str, Any])
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user's information.

    Requires: Bearer token in Authorization header

    Returns:
        User information from JWT token and database
    """
    try:
        user_id = current_user.get("id")

        # Query user from database
        result = supabase.table("sparkle_users").select("*").eq("id", user_id).execute()

        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found in database"
            )

        user_data = result.data[0]

        return {
            "status": "success",
            "data": {
                "id": user_data.get("id"),
                "email": user_data.get("email"),
                "full_name": user_data.get("full_name"),
                "avatar_url": user_data.get("avatar_url"),
                "linkedin_profile_url": user_data.get("linkedin_profile_url"),
                "created_at": user_data.get("created_at"),
                "updated_at": user_data.get("updated_at")
            },
            "message": "User retrieved successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving user: {str(e)}"
        )

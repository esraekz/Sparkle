from fastapi import APIRouter, Depends, HTTPException, status
from middleware.auth_middleware import get_current_user
from database import supabase
from models.user import UserResponse
from models.auth import LoginRequest, SignupRequest, AuthResponse
from typing import Dict, Any
import secrets

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Mock JWT token for Phase 1
MOCK_JWT_TOKEN = "mock_jwt_token_phase1_development"


@router.post("/login", response_model=Dict[str, Any])
async def login(credentials: LoginRequest):
    """
    Login user (Phase 1: Mock authentication)

    Phase 1: Returns mock token for any email/password
    Phase 2: Will validate credentials against Supabase Auth

    Returns:
        Mock JWT token and user data
    """
    try:
        # Phase 1: Accept any credentials and return mock user
        # In Phase 2, this will validate with Supabase Auth

        # For now, return mock user (test@sparkle.com)
        mock_user = {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "email": "test@sparkle.com",
            "full_name": "Test User",
            "role": "authenticated",
            "avatar_url": None,
            "linkedin_profile_url": None,
            "created_at": "2025-01-22T10:30:00Z",
            "updated_at": "2025-01-22T10:30:00Z"
        }

        return {
            "status": "success",
            "data": {
                "access_token": MOCK_JWT_TOKEN,
                "token_type": "bearer",
                "user": mock_user
            },
            "message": "Login successful"
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login error: {str(e)}"
        )


@router.post("/signup", response_model=Dict[str, Any])
async def signup(user_data: SignupRequest):
    """
    Signup new user (Phase 1: Mock authentication)

    Phase 1: Returns mock token without creating user
    Phase 2: Will create user in Supabase Auth

    Returns:
        Mock JWT token and user data
    """
    try:
        # Phase 1: Accept any signup and return mock user
        # In Phase 2, this will create user in Supabase Auth

        mock_user = {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "email": user_data.email,  # Use provided email
            "full_name": user_data.full_name,  # Use provided name
            "role": "authenticated",
            "avatar_url": None,
            "linkedin_profile_url": None,
            "created_at": "2025-01-22T10:30:00Z",
            "updated_at": "2025-01-22T10:30:00Z"
        }

        return {
            "status": "success",
            "data": {
                "access_token": MOCK_JWT_TOKEN,
                "token_type": "bearer",
                "user": mock_user
            },
            "message": "Signup successful"
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Signup error: {str(e)}"
        )


@router.get("/me", response_model=Dict[str, Any])
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user's information.

    Requires: Bearer token in Authorization header (Phase 1: automatically mocked)

    Returns:
        User information from JWT token and database
    """
    try:
        # Phase 1: Return mock user directly (no database query needed)
        # Phase 2: Will query database with current_user["id"]

        mock_user = {
            "id": current_user.get("id"),
            "email": current_user.get("email"),
            "full_name": current_user.get("full_name"),
            "role": current_user.get("role", "authenticated"),
            "avatar_url": None,
            "linkedin_profile_url": None,
            "created_at": "2025-01-22T10:30:00Z",
            "updated_at": "2025-01-22T10:30:00Z"
        }

        return {
            "status": "success",
            "data": mock_user,
            "message": "User retrieved successfully"
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving user: {str(e)}"
        )

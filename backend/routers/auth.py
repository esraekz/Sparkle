from fastapi import APIRouter, Depends, HTTPException, status
from middleware.auth_middleware import get_current_user
from database import supabase
from models.user import UserResponse
from models.auth import LoginRequest, SignupRequest, AuthResponse
from typing import Dict, Any
import secrets
import hashlib
import uuid
from jose import jwt
from datetime import datetime, timedelta

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Mock JWT secret for Phase 1 (for encoding user info in token)
MOCK_JWT_SECRET = "mock_jwt_secret_phase1_development_do_not_use_in_production"


def create_mock_jwt_token(user_id: str, email: str, full_name: str) -> str:
    """Create a mock JWT token with user information for Phase 1"""
    payload = {
        "sub": user_id,  # Standard JWT claim for user ID
        "email": email,
        "full_name": full_name,
        "role": "authenticated",
        "exp": datetime.utcnow() + timedelta(days=30),  # Token expires in 30 days
        "iat": datetime.utcnow(),  # Issued at
    }
    return jwt.encode(payload, MOCK_JWT_SECRET, algorithm="HS256")


def generate_user_id_from_email(email: str) -> str:
    """Generate a deterministic UUID from email for Phase 1 mock auth"""
    # Create a namespace UUID for Sparkle
    namespace = uuid.UUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')
    # Generate UUID5 from email (deterministic)
    return str(uuid.uuid5(namespace, email.lower()))


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

        # Generate deterministic user ID from email
        user_id = generate_user_id_from_email(credentials.email)

        full_name = credentials.email.split('@')[0].title()  # Use email username as name

        mock_user = {
            "id": user_id,
            "email": credentials.email,
            "full_name": full_name,
            "role": "authenticated",
            "avatar_url": None,
            "linkedin_profile_url": None,
            "created_at": "2025-01-22T10:30:00Z",
            "updated_at": "2025-01-22T10:30:00Z"
        }

        # Create JWT token with user info embedded
        access_token = create_mock_jwt_token(user_id, credentials.email, full_name)

        return {
            "status": "success",
            "data": {
                "access_token": access_token,
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

        # Generate deterministic user ID from email
        user_id = generate_user_id_from_email(user_data.email)

        mock_user = {
            "id": user_id,
            "email": user_data.email,  # Use provided email
            "full_name": user_data.full_name,  # Use provided name
            "role": "authenticated",
            "avatar_url": None,
            "linkedin_profile_url": None,
            "created_at": "2025-01-22T10:30:00Z",
            "updated_at": "2025-01-22T10:30:00Z"
        }

        # Create JWT token with user info embedded
        access_token = create_mock_jwt_token(user_id, user_data.email, user_data.full_name)

        return {
            "status": "success",
            "data": {
                "access_token": access_token,
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

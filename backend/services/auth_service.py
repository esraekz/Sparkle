from jose import JWTError, jwt
from fastapi import HTTPException, status
from config.settings import settings
from typing import Dict, Any


# ==============================================================================
# MOCK AUTHENTICATION (Phase 1 MVP)
# ==============================================================================
# TODO Phase 2: Remove mock auth and use real Supabase JWT verification
# ==============================================================================

MOCK_USER_ID = "123e4567-e89b-12d3-a456-426614174000"
MOCK_USER_EMAIL = "test@sparkle.com"
MOCK_USER_NAME = "Test User"


def get_mock_user() -> Dict[str, Any]:
    """
    Return mock user for Phase 1 MVP development.

    This allows backend development without real authentication.
    The mock user ID matches the user inserted in the database seed.

    Returns:
        Mock user information

    Note:
        This function will be removed in Phase 2 when real auth is implemented.
    """
    return {
        "id": MOCK_USER_ID,
        "email": MOCK_USER_EMAIL,
        "full_name": MOCK_USER_NAME,
        "role": "authenticated",
    }


# ==============================================================================
# REAL AUTHENTICATION (Phase 2 - Currently Not Used)
# ==============================================================================
# These functions are preserved for Phase 2 implementation
# ==============================================================================

def verify_jwt_token(token: str) -> Dict[str, Any]:
    """
    Verify and decode Supabase JWT token.

    Args:
        token: JWT token string

    Returns:
        Decoded token payload

    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated"
        )
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_user_from_token(token: str) -> Dict[str, Any]:
    """
    Extract user information from JWT token.

    Args:
        token: JWT token string

    Returns:
        User information from token payload
    """
    payload = verify_jwt_token(token)

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing user ID",
        )

    return {
        "id": user_id,
        "email": payload.get("email"),
        "role": payload.get("role"),
        "aud": payload.get("aud"),
    }

from jose import JWTError, jwt
from fastapi import HTTPException, status
from config.settings import settings
from typing import Dict, Any


# ==============================================================================
# MOCK AUTHENTICATION (Phase 1 MVP)
# ==============================================================================
# TODO Phase 2: Remove mock auth and use real Supabase JWT verification
# ==============================================================================

# Mock JWT secret (must match routers/auth.py)
MOCK_JWT_SECRET = "mock_jwt_secret_phase1_development_do_not_use_in_production"


def get_mock_user_from_token(token: str) -> Dict[str, Any]:
    """
    Decode mock JWT token and extract user information for Phase 1 MVP.

    Args:
        token: Mock JWT token string

    Returns:
        User information from token payload

    Note:
        This function will be removed in Phase 2 when real auth is implemented.
    """
    try:
        # Decode the mock JWT token
        payload = jwt.decode(token, MOCK_JWT_SECRET, algorithms=["HS256"])

        return {
            "id": payload.get("sub"),
            "email": payload.get("email"),
            "full_name": payload.get("full_name"),
            "role": payload.get("role", "authenticated"),
        }
    except JWTError as e:
        # If token is invalid, raise HTTP exception
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid mock token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


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

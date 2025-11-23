from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from services.auth_service import get_user_from_token, get_mock_user_from_token
from config.settings import settings
from typing import Dict, Any, Optional


security = HTTPBearer(auto_error=False)  # Don't auto-error if no token (for mock auth)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Dict[str, Any]:
    """
    FastAPI dependency for extracting and validating current user.

    Phase 1 MVP: Returns mock user (no JWT verification required)
    Phase 2: Will verify real Supabase JWT tokens

    Usage in route:
        @router.get("/me")
        async def get_me(current_user: dict = Depends(get_current_user)):
            return current_user

    Args:
        credentials: HTTP Bearer token from Authorization header (optional in Phase 1)

    Returns:
        Current user information

    Raises:
        HTTPException: If token is missing or invalid (Phase 2 only)
    """
    # ==============================================================================
    # PHASE 1: Mock Authentication
    # ==============================================================================
    # TODO Phase 2: Remove this block and uncomment real auth below
    # ==============================================================================
    if settings.USE_MOCK_AUTH:
        # Verify token is provided
        if not credentials:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Decode mock JWT token and extract user info
        token = credentials.credentials
        return get_mock_user_from_token(token)

    # ==============================================================================
    # PHASE 2: Real Authentication (Currently Disabled)
    # ==============================================================================
    # Uncomment this block when USE_MOCK_AUTH is set to False
    # ==============================================================================

    # Verify token is provided
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify and decode JWT token
    token = credentials.credentials
    user = get_user_from_token(token)

    return user

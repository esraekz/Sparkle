from .health import router as health_router
from .auth import router as auth_router
from .onboarding import router as onboarding_router
from .posts import router as posts_router

__all__ = ["health_router", "auth_router", "onboarding_router", "posts_router"]

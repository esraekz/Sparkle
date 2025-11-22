from fastapi import APIRouter, HTTPException
from database import supabase
from typing import Dict, Any

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint to verify API and database connectivity.

    Returns:
        JSON with status and database connection info
    """
    try:
        # Test Supabase connection by querying the sparkle schema
        # This is a simple check - just verify we can connect
        result = supabase.table("sparkle_users").select("id").limit(1).execute()

        return {
            "status": "success",
            "data": {
                "api": "healthy",
                "database": "connected",
                "schema": "sparkle"
            },
            "message": "All systems operational"
        }
    except Exception as e:
        # If database connection fails, still return 200 but indicate the issue
        return {
            "status": "degraded",
            "data": {
                "api": "healthy",
                "database": "error",
                "error": str(e)
            },
            "message": "API running but database connection issue"
        }

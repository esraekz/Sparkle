from supabase import create_client, Client
from config.settings import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_supabase_client() -> Client:
    """
    Create and return Supabase client with error handling.

    Returns:
        Supabase client instance

    Raises:
        ValueError: If Supabase credentials are missing
    """
    try:
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")

        client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY
        )

        logger.info("✅ Supabase client initialized successfully")
        return client

    except Exception as e:
        logger.error(f"❌ Failed to initialize Supabase client: {str(e)}")
        raise


# Global Supabase client instance
supabase: Client = get_supabase_client()
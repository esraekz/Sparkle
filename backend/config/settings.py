from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    Uses Pydantic Settings for type-safe configuration.
    """

    # Supabase Configuration
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_JWT_SECRET: str

    # API Configuration
    API_VERSION: str = "v1"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"

    # Authentication Configuration
    # Phase 1: Use mock auth (no real JWT verification)
    # Phase 2: Switch to real Supabase Auth (set to False)
    USE_MOCK_AUTH: bool = True

    # CORS Settings
    ALLOWED_ORIGINS: str = "*"

    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )

    @property
    def cors_origins(self) -> List[str]:
        """Parse ALLOWED_ORIGINS into a list"""
        if self.ALLOWED_ORIGINS == "*":
            return ["*"]
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


# Global settings instance
settings = Settings()

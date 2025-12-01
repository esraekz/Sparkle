"""
LLM Service - Abstraction layer for AI providers (OpenAI, Anthropic)

This service provides a unified interface for interacting with different LLM providers.
It handles retries, timeouts, error handling, and token usage logging.
"""

import logging
import asyncio
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from config.settings import settings

logger = logging.getLogger(__name__)


class BaseLLMProvider(ABC):
    """Abstract base class for LLM providers"""

    @abstractmethod
    async def generate_completion(
        self,
        prompt: str,
        max_tokens: int = 1000,
        temperature: float = 0.7
    ) -> str:
        """
        Generate a completion from the LLM.

        Args:
            prompt: The input prompt
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature (0.0 - 1.0)

        Returns:
            Generated text

        Raises:
            Exception: If generation fails
        """
        pass


class OpenAIProvider(BaseLLMProvider):
    """OpenAI GPT-4 provider"""

    def __init__(self, api_key: str):
        try:
            from openai import AsyncOpenAI
            self.client = AsyncOpenAI(api_key=api_key, timeout=settings.LLM_TIMEOUT)
            self.model = "gpt-4o-mini"  # Fast, affordable, high-quality model
            logger.info("✅ OpenAI provider initialized (gpt-4o-mini)")
        except ImportError:
            raise ImportError("openai package not installed. Run: pip install openai>=1.0.0")

    async def generate_completion(
        self,
        prompt: str,
        max_tokens: int = 1000,
        temperature: float = 0.7
    ) -> str:
        """Generate completion using OpenAI GPT-4"""
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a professional LinkedIn content creator helping users write engaging posts."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )

            # Log token usage
            usage = response.usage
            logger.info(
                f"📊 OpenAI tokens: prompt={usage.prompt_tokens}, "
                f"completion={usage.completion_tokens}, total={usage.total_tokens}"
            )

            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"❌ OpenAI generation error: {str(e)}")
            raise


class AnthropicProvider(BaseLLMProvider):
    """Anthropic Claude provider"""

    def __init__(self, api_key: str):
        try:
            from anthropic import AsyncAnthropic
            self.client = AsyncAnthropic(api_key=api_key, timeout=settings.LLM_TIMEOUT)
            self.model = "claude-3-5-sonnet-20241022"
            logger.info("✅ Anthropic provider initialized")
        except ImportError:
            raise ImportError("anthropic package not installed. Run: pip install anthropic>=0.7.0")

    async def generate_completion(
        self,
        prompt: str,
        max_tokens: int = 1000,
        temperature: float = 0.7
    ) -> str:
        """Generate completion using Anthropic Claude"""
        try:
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            # Log token usage
            usage = response.usage
            logger.info(
                f"📊 Anthropic tokens: input={usage.input_tokens}, "
                f"output={usage.output_tokens}"
            )

            return response.content[0].text

        except Exception as e:
            logger.error(f"❌ Anthropic generation error: {str(e)}")
            raise


class LLMService:
    """
    Main LLM service with retry logic and provider management.

    Usage:
        llm = LLMService()
        result = await llm.generate_completion("Write a post about...")
    """

    def __init__(self):
        """Initialize LLM service with configured provider"""
        self.provider = self._initialize_provider()
        self.max_retries = 3
        self.retry_delays = [1, 2, 4]  # Exponential backoff (seconds)

    def _initialize_provider(self) -> BaseLLMProvider:
        """
        Initialize the LLM provider based on configuration.

        Returns:
            Configured LLM provider instance

        Raises:
            ValueError: If provider configuration is invalid
        """
        provider_name = settings.LLM_PROVIDER.lower()

        if provider_name == "openai":
            if not settings.OPENAI_API_KEY:
                raise ValueError(
                    "OPENAI_API_KEY not set. Please configure your OpenAI API key in .env"
                )
            return OpenAIProvider(settings.OPENAI_API_KEY)

        elif provider_name == "anthropic":
            if not settings.ANTHROPIC_API_KEY:
                raise ValueError(
                    "ANTHROPIC_API_KEY not set. Please configure your Anthropic API key in .env"
                )
            return AnthropicProvider(settings.ANTHROPIC_API_KEY)

        else:
            raise ValueError(
                f"Unknown LLM provider: {provider_name}. "
                f"Supported providers: openai, anthropic"
            )

    async def generate_completion(
        self,
        prompt: str,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None
    ) -> str:
        """
        Generate a completion with retry logic.

        Args:
            prompt: The input prompt
            max_tokens: Maximum tokens (defaults to settings.LLM_MAX_TOKENS)
            temperature: Sampling temperature (defaults to settings.LLM_TEMPERATURE)

        Returns:
            Generated text

        Raises:
            Exception: If all retries fail
        """
        max_tokens = max_tokens or settings.LLM_MAX_TOKENS
        temperature = temperature or settings.LLM_TEMPERATURE

        last_error = None

        for attempt in range(self.max_retries):
            try:
                logger.info(f"🤖 LLM generation attempt {attempt + 1}/{self.max_retries}")

                result = await self.provider.generate_completion(
                    prompt=prompt,
                    max_tokens=max_tokens,
                    temperature=temperature
                )

                logger.info(f"✅ LLM generation successful on attempt {attempt + 1}")
                return result

            except Exception as e:
                last_error = e
                logger.warning(
                    f"⚠️  LLM attempt {attempt + 1} failed: {str(e)}"
                )

                # Don't sleep after last attempt
                if attempt < self.max_retries - 1:
                    delay = self.retry_delays[attempt]
                    logger.info(f"⏳ Retrying in {delay} seconds...")
                    await asyncio.sleep(delay)

        # All retries failed
        logger.error(f"❌ All {self.max_retries} LLM attempts failed")
        raise Exception(
            f"AI service temporarily unavailable. Please try again later. "
            f"(Last error: {str(last_error)})"
        )


# Singleton instance
_llm_service: Optional[LLMService] = None


def get_llm_service() -> LLMService:
    """
    Get or create the global LLM service instance.

    Returns:
        LLM service instance
    """
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service

"""
Generation Service - Business logic for AI-powered post generation

This service coordinates the AI content generation process:
1. Fetch user's brand blueprint for personalization
2. Build prompts with user context
3. Generate content via LLM
4. Always return: content, hashtags, hook_suggestion
"""

import logging
import re
import json
from typing import Dict, Any, List
from fastapi import HTTPException, status

from .llm_service import get_llm_service
from config import prompts
from services.onboarding_service import get_brand_blueprint

logger = logging.getLogger(__name__)


class GenerationService:
    """
    Service for generating and improving LinkedIn post content using AI.

    All methods return a consistent response format:
    {
        "content": "generated/improved text...",
        "hashtags": ["#leadership", "#AI", "#growth"],
        "hook_suggestion": "Alternative opening line..."
    }
    """

    def __init__(self):
        """Initialize generation service"""
        self.llm = get_llm_service()

    def _parse_ai_response(self, response: str) -> Dict[str, Any]:
        """
        Parse JSON response from AI containing content, hashtags, and hook.

        Args:
            response: Raw response from LLM (may contain markdown code blocks)

        Returns:
            Dict with content, hashtags array, and hook_suggestion string

        Raises:
            json.JSONDecodeError: If response is not valid JSON
        """
        try:
            # Remove markdown code blocks if present (```json ... ```)
            cleaned = re.sub(r'```json\n?|\n?```', '', response.strip())

            # Parse JSON
            data = json.loads(cleaned)

            # Extract and validate fields
            return {
                "content": data.get("content", "").strip(),
                "hashtags": data.get("hashtags", []),
                "hook_suggestion": data.get("hook", "")
            }
        except json.JSONDecodeError as e:
            logger.error(f"❌ Failed to parse AI JSON response: {str(e)}")
            logger.error(f"Raw response: {response[:200]}...")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="AI returned invalid response format"
            )

    async def _get_user_context(self, user_id: str) -> Dict[str, Any]:
        """
        Fetch user's brand blueprint for personalization.

        Args:
            user_id: User's UUID

        Returns:
            Dict with tone, topics, and goal

        Raises:
            HTTPException: If brand blueprint not found
        """
        try:
            blueprint = await get_brand_blueprint(user_id)

            # Format topics as comma-separated string
            topics_str = ", ".join(blueprint.get("topics", []))

            return {
                "tone": blueprint.get("tone", "Professional"),
                "topics": topics_str if topics_str else "General professional topics",
                "goal": blueprint.get("main_goal", "Build thought leadership"),
            }

        except HTTPException:
            # Brand blueprint not found - use defaults
            logger.warning(f"Brand blueprint not found for user {user_id}, using defaults")
            return {
                "tone": "Professional",
                "topics": "General professional topics",
                "goal": "Build thought leadership",
            }

    async def continue_writing(self, user_id: str, current_text: str) -> Dict[str, Any]:
        """
        Continue writing the user's post.

        Args:
            user_id: User's UUID
            current_text: Current post text

        Returns:
            Dict with content, hashtags, hook_suggestion
        """
        if not current_text or not current_text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please provide some text to continue from"
            )

        try:
            logger.info(f"✏️  Continue writing for user {user_id}")

            # Get user context
            user_context = await self._get_user_context(user_id)

            # Build prompt (now returns JSON with content, hashtags, hook)
            action_prompt = prompts.build_prompt(
                prompts.CONTINUE_WRITING_PROMPT,
                tone=user_context["tone"],
                topics=user_context["topics"],
                goal=user_context["goal"],
                current_text=current_text
            )

            # Single API call - get continuation, hashtags, and hook all at once
            response = await self.llm.generate_completion(action_prompt)

            # Parse JSON response
            parsed = self._parse_ai_response(response)

            # Combine original text + AI continuation
            full_content = current_text + "\n\n" + parsed["content"]

            return {
                "content": full_content,
                "hashtags": parsed["hashtags"],
                "hook_suggestion": parsed["hook_suggestion"]
            }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Continue writing failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate content: {str(e)}"
            )

    async def rephrase(self, user_id: str, text_to_rephrase: str) -> Dict[str, Any]:
        """
        Rephrase the selected text.

        Args:
            user_id: User's UUID
            text_to_rephrase: Text to rewrite

        Returns:
            Dict with content, hashtags, hook_suggestion
        """
        if not text_to_rephrase or not text_to_rephrase.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please provide text to rephrase"
            )

        try:
            logger.info(f"🔄 Rephrasing for user {user_id}")

            # Get user context
            user_context = await self._get_user_context(user_id)

            # Build prompt (now returns JSON with content, hashtags, hook)
            action_prompt = prompts.build_prompt(
                prompts.REPHRASE_PROMPT,
                tone=user_context["tone"],
                topics=user_context["topics"],
                goal=user_context["goal"],
                text_to_rephrase=text_to_rephrase
            )

            # Single API call - get rephrased text, hashtags, and hook all at once
            response = await self.llm.generate_completion(action_prompt)

            # Parse JSON response
            return self._parse_ai_response(response)

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Rephrase failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to rephrase content: {str(e)}"
            )

    async def correct_grammar(self, user_id: str, text: str) -> Dict[str, Any]:
        """
        Fix spelling and grammar errors.

        Args:
            user_id: User's UUID
            text: Text to correct

        Returns:
            Dict with content, hashtags, hook_suggestion
        """
        if not text or not text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please provide text to correct"
            )

        try:
            logger.info(f"✅ Correcting grammar for user {user_id}")

            # Get user context (for context, though not used in prompt)
            user_context = await self._get_user_context(user_id)

            # Build prompt (now returns JSON with content, hashtags, hook)
            action_prompt = prompts.build_prompt(
                prompts.CORRECT_GRAMMAR_PROMPT,
                text=text
            )

            # Single API call - get corrected text, hashtags, and hook all at once
            response = await self.llm.generate_completion(action_prompt)

            # Parse JSON response
            return self._parse_ai_response(response)

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Grammar correction failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to correct grammar: {str(e)}"
            )

    async def improve_engagement(self, user_id: str, text: str) -> Dict[str, Any]:
        """
        Make the text more engaging and compelling.

        Args:
            user_id: User's UUID
            text: Text to improve

        Returns:
            Dict with content, hashtags, hook_suggestion
        """
        if not text or not text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please provide text to improve"
            )

        try:
            logger.info(f"💪 Improving engagement for user {user_id}")

            # Get user context
            user_context = await self._get_user_context(user_id)

            # Build prompt (now returns JSON with content, hashtags, hook)
            action_prompt = prompts.build_prompt(
                prompts.IMPROVE_ENGAGEMENT_PROMPT,
                tone=user_context["tone"],
                topics=user_context["topics"],
                goal=user_context["goal"],
                text=text
            )

            # Single API call - get improved text, hashtags, and hook all at once
            response = await self.llm.generate_completion(action_prompt)

            # Parse JSON response
            return self._parse_ai_response(response)

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Engagement improvement failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to improve engagement: {str(e)}"
            )

    async def make_shorter(self, user_id: str, text: str) -> Dict[str, Any]:
        """
        Condense the text while keeping the core message.

        Args:
            user_id: User's UUID
            text: Text to shorten

        Returns:
            Dict with content, hashtags, hook_suggestion
        """
        if not text or not text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please provide text to shorten"
            )

        try:
            logger.info(f"✂️  Shortening text for user {user_id}")

            # Get user context
            user_context = await self._get_user_context(user_id)

            # Build prompt (now returns JSON with content, hashtags, hook)
            action_prompt = prompts.build_prompt(
                prompts.MAKE_SHORTER_PROMPT,
                tone=user_context["tone"],
                topics=user_context["topics"],
                text=text
            )

            # Single API call - get shortened text, hashtags, and hook all at once
            response = await self.llm.generate_completion(action_prompt)

            # Parse JSON response
            return self._parse_ai_response(response)

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Shortening failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to shorten content: {str(e)}"
            )


# Singleton instance
_generation_service: GenerationService = None


def get_generation_service() -> GenerationService:
    """
    Get or create the global generation service instance.

    Returns:
        Generation service instance
    """
    global _generation_service
    if _generation_service is None:
        _generation_service = GenerationService()
    return _generation_service

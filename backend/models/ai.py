"""
AI Models - Pydantic schemas for AI-powered content generation

These models define the request/response formats for the AI assist endpoint.
"""

from pydantic import BaseModel, Field
from typing import List
from enum import Enum


class AIAction(str, Enum):
    """AI action types"""
    CONTINUE = "continue"
    REPHRASE = "rephrase"
    GRAMMAR = "grammar"
    ENGAGEMENT = "engagement"
    SHORTER = "shorter"


class AIAssistRequest(BaseModel):
    """
    Request schema for AI assistance.

    The action determines which AI operation to perform on the text.
    """
    action: AIAction = Field(
        ...,
        description="AI action to perform: continue, rephrase, grammar, engagement, shorter"
    )
    text: str = Field(
        ...,
        min_length=1,
        description="Text to process (current post content or selected text)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "action": "continue",
                "text": "Leadership is about making tough decisions"
            }
        }


class AIAssistResponse(BaseModel):
    """
    Response schema for AI assistance.

    Always includes content, hashtags, and a hook suggestion.
    """
    content: str = Field(
        ...,
        description="Generated or improved content"
    )
    hashtags: List[str] = Field(
        ...,
        description="3-5 relevant hashtags (without # symbol)"
    )
    hook_suggestion: str = Field(
        ...,
        description="Alternative opening line to improve engagement"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "content": "Leadership is about making tough decisions. But the best leaders know when to pause, listen, and pivot based on new information. Here's what I've learned...",
                "hashtags": ["Leadership", "DecisionMaking", "GrowthMindset"],
                "hook_suggestion": "The hardest lesson I learned about leadership? Admitting when I was wrong."
            }
        }

from pydantic import BaseModel, field_validator
from typing import Optional
from enum import Enum


class ImageSource(str, Enum):
    """Image generation source type"""
    POST_CONTENT = "post_content"
    CUSTOM_DESCRIPTION = "custom_description"  # Phase 2: Custom prompts


class ImageGenerateRequest(BaseModel):
    """Schema for AI image generation request"""
    post_text: str = ""
    source: ImageSource = ImageSource.POST_CONTENT
    custom_prompt: Optional[str] = None

    @field_validator('custom_prompt')
    @classmethod
    def validate_custom_prompt(cls, v, info):
        """Validate custom_prompt based on source"""
        source = info.data.get('source')

        # If source is custom_description, custom_prompt is required
        if source == ImageSource.CUSTOM_DESCRIPTION:
            if not v or not v.strip():
                raise ValueError("custom_prompt is required when source is 'custom_description'")
            if len(v.strip()) < 10:
                raise ValueError("custom_prompt must be at least 10 characters")
            if len(v.strip()) > 500:
                raise ValueError("custom_prompt cannot exceed 500 characters")

        return v

    @field_validator('post_text')
    @classmethod
    def validate_post_text(cls, v, info):
        """Validate post_text based on source"""
        source = info.data.get('source')

        # If source is post_content, post_text is required
        if source == ImageSource.POST_CONTENT:
            if not v or not v.strip():
                raise ValueError("post_text is required when source is 'post_content'")
            if len(v.strip()) < 20:
                raise ValueError("post_text must be at least 20 characters when source is 'post_content'")

        return v


class ImageGenerateResponse(BaseModel):
    """Schema for AI image generation response"""
    image_url: str

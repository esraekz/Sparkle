from pydantic import BaseModel
from enum import Enum


class ImageSource(str, Enum):
    """Image generation source type"""
    POST_CONTENT = "post_content"
    CUSTOM_DESCRIPTION = "custom_description"  # Future: Phase 2


class ImageGenerateRequest(BaseModel):
    """Schema for AI image generation request"""
    post_text: str
    source: ImageSource = ImageSource.POST_CONTENT


class ImageGenerateResponse(BaseModel):
    """Schema for AI image generation response"""
    image_url: str

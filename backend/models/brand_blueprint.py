from pydantic import BaseModel, UUID4
from typing import List, Optional, Dict, Any
from datetime import time, datetime


class PostingPreferences(BaseModel):
    """Posting preferences sub-model"""
    preferred_days: List[str]
    preferred_hours: List[int]
    posts_per_week: int
    ask_before_publish: bool = True


class BrandBlueprintBase(BaseModel):
    """Base brand blueprint model"""
    topics: List[str]
    main_goal: str
    tone: str
    inspirations: List[str]
    posting_preferences: PostingPreferences


class BrandBlueprintCreate(BrandBlueprintBase):
    """Schema for creating a brand blueprint during onboarding"""
    pass


class BrandBlueprintUpdate(BaseModel):
    """Schema for updating brand blueprint (all fields optional)"""
    topics: Optional[List[str]] = None
    main_goal: Optional[str] = None
    tone: Optional[str] = None
    inspirations: Optional[List[str]] = None
    posting_preferences: Optional[PostingPreferences] = None


class BrandBlueprintResponse(BrandBlueprintBase):
    """Schema for brand blueprint response"""
    id: UUID4
    user_id: UUID4
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

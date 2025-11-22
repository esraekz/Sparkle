from pydantic import BaseModel, UUID4
from typing import List, Optional
from datetime import time, datetime


class BrandBlueprintBase(BaseModel):
    """Base brand blueprint model"""
    topics: List[str]
    goal: str
    tone: str
    posting_frequency: str
    preferred_days: List[str]
    best_time_to_post: Optional[time] = None
    ask_before_publish: bool = True


class BrandBlueprintCreate(BrandBlueprintBase):
    """Schema for creating a brand blueprint during onboarding"""
    pass


class BrandBlueprintUpdate(BaseModel):
    """Schema for updating brand blueprint (all fields optional)"""
    topics: Optional[List[str]] = None
    goal: Optional[str] = None
    tone: Optional[str] = None
    posting_frequency: Optional[str] = None
    preferred_days: Optional[List[str]] = None
    best_time_to_post: Optional[time] = None
    ask_before_publish: Optional[bool] = None


class BrandBlueprintResponse(BrandBlueprintBase):
    """Schema for brand blueprint response"""
    id: UUID4
    user_id: UUID4
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

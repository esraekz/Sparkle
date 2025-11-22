from pydantic import BaseModel, UUID4
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class PostStatus(str, Enum):
    """Post status enumeration"""
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"


class SourceType(str, Enum):
    """Post source type enumeration"""
    AI_GENERATED = "ai_generated"
    MANUAL = "manual"
    TRENDING_NEWS = "trending_news"


class PostBase(BaseModel):
    """Base post model"""
    content: str
    hashtags: Optional[List[str]] = []


class PostCreate(PostBase):
    """Schema for creating a new post"""
    source_type: SourceType = SourceType.MANUAL
    source_article_id: Optional[UUID4] = None


class PostUpdate(BaseModel):
    """Schema for updating a post (all fields optional)"""
    content: Optional[str] = None
    hashtags: Optional[List[str]] = None


class PostSchedule(BaseModel):
    """Schema for scheduling a post"""
    scheduled_for: datetime


class PostResponse(PostBase):
    """Schema for post response"""
    id: UUID4
    user_id: UUID4
    status: PostStatus
    source_type: SourceType
    source_article_id: Optional[UUID4] = None
    scheduled_for: Optional[datetime] = None
    published_at: Optional[datetime] = None
    engagement_metrics: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PostListResponse(BaseModel):
    """Schema for listing multiple posts"""
    posts: List[PostResponse]
    count: int
    filter: Optional[str] = None

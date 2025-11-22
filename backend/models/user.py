from pydantic import BaseModel, EmailStr, UUID4
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """Base user model with common fields"""
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    """Schema for creating a new user"""
    password: str


class UserResponse(BaseModel):
    """Schema for user response (excludes sensitive data)"""
    id: UUID4
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    linkedin_profile_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

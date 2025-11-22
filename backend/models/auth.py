"""
Authentication request/response models
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class LoginRequest(BaseModel):
    """Schema for login request"""
    email: EmailStr
    password: str


class SignupRequest(BaseModel):
    """Schema for signup request"""
    email: EmailStr
    password: str
    full_name: str


class AuthResponse(BaseModel):
    """Schema for authentication response"""
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserInToken(BaseModel):
    """User data embedded in token"""
    id: str
    email: str
    full_name: str

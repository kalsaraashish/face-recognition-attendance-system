"""Pydantic schemas for authentication endpoints."""
from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)

    model_config = {"json_schema_extra": {"example": {"email": "admin@attendance.com", "password": "Admin@123456"}}}


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds
    user: "UserOut"


class RefreshRequest(BaseModel):
    refresh_token: str


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole
    status: bool

    model_config = {"from_attributes": True}


TokenResponse.model_rebuild()

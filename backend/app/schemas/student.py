"""Pydantic schemas for Student CRUD and responses."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class StudentCreate(BaseModel):
    enrollment_no: str = Field(..., min_length=3, max_length=50)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    mobile: Optional[str] = Field(None, max_length=15)
    department_id: int
    semester: int = Field(..., ge=1, le=8)

    model_config = {
        "json_schema_extra": {
            "example": {
                "enrollment_no": "MCA2024001",
                "first_name": "Rohan",
                "last_name": "Patel",
                "email": "rohan.patel@student.edu",
                "mobile": "9876543210",
                "department_id": 1,
                "semester": 3,
            }
        }
    }


class StudentUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    mobile: Optional[str] = Field(None, max_length=15)
    department_id: Optional[int] = None
    semester: Optional[int] = Field(None, ge=1, le=8)
    status: Optional[bool] = None


class DepartmentBrief(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class StudentOut(BaseModel):
    id: int
    enrollment_no: str
    first_name: str
    last_name: str
    full_name: str
    email: str
    mobile: Optional[str]
    department_id: int
    department: Optional[DepartmentBrief]
    semester: int
    photo_url: Optional[str]
    status: bool
    created_at: datetime
    updated_at: datetime
    has_face_registered: bool = False

    model_config = {"from_attributes": True}


class StudentListResponse(BaseModel):
    students: list[StudentOut]
    total: int
    page: int
    per_page: int
    total_pages: int

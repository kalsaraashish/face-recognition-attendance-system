"""Pydantic schemas for Faculty CRUD and responses."""
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class FacultyCreate(BaseModel):
    faculty_code: str = Field(..., min_length=2, max_length=50)
    name: str = Field(..., min_length=1, max_length=150)
    email: EmailStr
    mobile: Optional[str] = Field(None, max_length=15)
    department_id: int
    # Password for the linked user account
    password: str = Field(..., min_length=8)

    model_config = {
        "json_schema_extra": {
            "example": {
                "faculty_code": "FAC001",
                "name": "Dr. Priya Sharma",
                "email": "priya.sharma@college.edu",
                "mobile": "9123456780",
                "department_id": 1,
                "password": "Faculty@123",
            }
        }
    }


class FacultyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    email: Optional[EmailStr] = None
    mobile: Optional[str] = Field(None, max_length=15)
    department_id: Optional[int] = None
    status: Optional[bool] = None


class DepartmentBrief(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class FacultyOut(BaseModel):
    id: int
    faculty_code: str
    name: str
    email: str
    mobile: Optional[str]
    department_id: int
    department: Optional[DepartmentBrief]
    status: bool
    has_face_registered: bool = False
    photo_url: Optional[str] = None

    model_config = {"from_attributes": True}


class FacultyListResponse(BaseModel):
    faculties: list[FacultyOut]
    total: int
    page: int
    per_page: int
    total_pages: int

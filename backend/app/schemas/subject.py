"""Pydantic schemas for Subject CRUD."""
from typing import Optional

from pydantic import BaseModel, Field


class SubjectCreate(BaseModel):
    subject_code: str = Field(..., min_length=2, max_length=50)
    subject_name: str = Field(..., min_length=2, max_length=200)
    department_id: int
    semester: int = Field(..., ge=1, le=8)

    model_config = {
        "json_schema_extra": {
            "example": {"subject_code": "MCA301", "subject_name": "Machine Learning", "department_id": 1, "semester": 3}
        }
    }


class SubjectUpdate(BaseModel):
    subject_name: Optional[str] = Field(None, min_length=2, max_length=200)
    department_id: Optional[int] = None
    semester: Optional[int] = Field(None, ge=1, le=8)


class DepartmentBrief(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class SubjectOut(BaseModel):
    id: int
    subject_code: str
    subject_name: str
    department_id: int
    department: Optional[DepartmentBrief]
    semester: int

    model_config = {"from_attributes": True}

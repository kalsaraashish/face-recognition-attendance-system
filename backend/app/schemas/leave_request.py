"""Pydantic schemas for Leave Requests."""
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.models.leave_request import LeaveStatus


class LeaveRequestCreate(BaseModel):
    start_date: date
    end_date: date
    reason: str = Field(..., min_length=5, max_length=1000)


class LeaveRequestReview(BaseModel):
    status: LeaveStatus = Field(...)


class StudentBrief(BaseModel):
    id: int
    enrollment_no: str
    first_name: str
    last_name: str
    email: str

    model_config = {"from_attributes": True}


class ReviewerBrief(BaseModel):
    id: int
    name: str
    email: str

    model_config = {"from_attributes": True}


class LeaveRequestOut(BaseModel):
    id: int
    student_id: int
    student: Optional[StudentBrief] = None
    start_date: date
    end_date: date
    reason: str
    status: LeaveStatus
    applied_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[int] = None
    reviewer: Optional[ReviewerBrief] = None

    model_config = {"from_attributes": True}

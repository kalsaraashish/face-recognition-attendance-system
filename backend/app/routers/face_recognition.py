"""
Face Recognition router.
POST /api/face/register/{student_id}  — upload & register face images (Admin)
POST /api/face/recognize              — recognize a face from uploaded image
DELETE /api/face/{student_id}         — remove stored encodings (Admin)
"""
from typing import List

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_admin, require_admin_or_faculty
from app.schemas.attendance import RecognitionResult
from app.services.face_service import FaceService
from app.utils.image_utils import read_upload_bytes, validate_image_upload

router = APIRouter(prefix="/face", tags=["Face Recognition"])


@router.post(
    "/register/{student_id}",
    summary="Register face images for a student",
)
async def register_face(
    student_id: int,
    images: List[UploadFile] = File(..., description="One or more face images (JPEG/PNG)"),
    db: Session = Depends(get_db),
    _=Depends(require_admin_or_faculty),
):
    """
    Upload 1–10 face images for a student. Each image must contain exactly one face.
    The system extracts 128-d face encodings and stores them in the database.
    """
    service = FaceService(db)
    image_data: list[tuple[bytes, str]] = []

    for upload in images:
        validate_image_upload(upload)
        data = await read_upload_bytes(upload)
        filename = upload.filename or f"face_{student_id}.jpg"
        image_data.append((data, filename))

    return service.register_multiple_faces(student_id, image_data)


@router.post(
    "/recognize",
    response_model=RecognitionResult,
    summary="Recognize a face from an uploaded image",
)
async def recognize_face(
    image: UploadFile = File(..., description="Image containing the face to recognize"),
    db: Session = Depends(get_db),
    _=Depends(require_admin_or_faculty),
):
    """
    Upload an image and compare its face encoding against all stored student encodings.
    Returns the best-matching student along with a confidence score.
    """
    validate_image_upload(image)
    data = await read_upload_bytes(image)
    return FaceService(db).recognize_face(data)


@router.delete(
    "/{student_id}",
    summary="Delete all stored face encodings for a student (Admin)",
)
def delete_face_encodings(
    student_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin_or_faculty),
):
    return FaceService(db).delete_student_encodings(student_id)


@router.post(
    "/register/faculty/{faculty_id}",
    summary="Register face images for a faculty member (Admin)",
)
async def register_faculty_face(
    faculty_id: int,
    images: List[UploadFile] = File(..., description="One or more face images (JPEG/PNG)"),
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    """
    Upload 1–10 face images for a faculty member. Each image must contain exactly one face.
    The system extracts 128-d face encodings and stores them in the database.
    """
    service = FaceService(db)
    image_data: list[tuple[bytes, str]] = []

    for upload in images:
        validate_image_upload(upload)
        data = await read_upload_bytes(upload)
        filename = upload.filename or f"face_fac_{faculty_id}.jpg"
        image_data.append((data, filename))

    return service.register_multiple_faculty_faces(faculty_id, image_data)


@router.delete(
    "/faculty/{faculty_id}",
    summary="Delete all stored face encodings for a faculty member (Admin)",
)
def delete_faculty_face_encodings(
    faculty_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    return FaceService(db).delete_faculty_encodings(faculty_id)

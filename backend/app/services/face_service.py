"""
Face recognition service.
Handles face encoding registration and real-time recognition against stored encodings.
"""
import json
from pathlib import Path
from typing import Optional

import numpy as np
from loguru import logger
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import (
    FaceNotDetectedError,
    FaceNotRecognizedError,
    MultipleFacesError,
    NotFoundError,
    InternalServerError,
)
from app.models.face_encoding import FaceEncoding
from app.models.student import Student
from app.schemas.attendance import RecognitionResult
from app.utils.face_utils import (
    decode_image_bytes,
    detect_and_encode_face,
    load_known_encodings,
    find_best_match,
)
from app.utils.image_utils import save_upload_file


class FaceService:
    def __init__(self, db: Session):
        self.db = db

    # ── Register Face ─────────────────────────────────────────────
    def register_face(self, student_id: int, image_bytes: bytes, filename: str) -> dict:
        """
        Process a single face image, extract encoding, persist it,
        and save the image file to disk.
        """
        # Verify student exists
        student = self.db.query(Student).filter(Student.id == student_id).first()
        if not student:
            raise NotFoundError("Student")

        # Decode image and extract face encoding
        image_array = decode_image_bytes(image_bytes)
        encoding = detect_and_encode_face(image_array)  # raises on 0 or 2+ faces

        # Persist encoding as JSON
        encoding_json = json.dumps(encoding.tolist())
        face_enc = FaceEncoding(student_id=student_id, encoding_data=encoding_json)
        self.db.add(face_enc)

        # Save image file
        save_path = (
            Path(settings.UPLOAD_DIR)
            / "students"
            / str(student_id)
            / filename
        )
        save_upload_file(image_bytes, save_path)

        # Update student photo URL to the first uploaded image
        if not student.photo_url:
            student.photo_url = str(save_path)

        self.db.commit()
        logger.info(f"Face registered for student {student_id}, encoding id={face_enc.id}")
        return {
            "message": "Face registered successfully",
            "student_id": student_id,
            "encoding_id": face_enc.id,
        }

    def register_multiple_faces(
        self, student_id: int, images: list[tuple[bytes, str]]
    ) -> dict:
        """Register multiple face images for a student in one call."""
        results = []
        for image_bytes, filename in images:
            try:
                result = self.register_face(student_id, image_bytes, filename)
                results.append({"filename": filename, "status": "success", **result})
            except (FaceNotDetectedError, MultipleFacesError) as exc:
                results.append({"filename": filename, "status": "failed", "reason": str(exc.detail)})

        registered = sum(1 for r in results if r["status"] == "success")
        return {
            "student_id": student_id,
            "total_uploaded": len(images),
            "registered": registered,
            "results": results,
        }

    def delete_student_encodings(self, student_id: int) -> dict:
        """Remove all stored face encodings for a student."""
        deleted = (
            self.db.query(FaceEncoding)
            .filter(FaceEncoding.student_id == student_id)
            .delete()
        )
        self.db.commit()
        logger.info(f"Deleted {deleted} encodings for student {student_id}")
        return {"deleted_count": deleted}

    # ── Recognize Face ────────────────────────────────────────────
    def recognize_face(self, image_bytes: bytes) -> RecognitionResult:
        """
        Compare uploaded image against all stored encodings and return
        the best match (if any is within tolerance).
        """
        # Load all known encodings from DB
        all_encodings = self.db.query(FaceEncoding).all()
        if not all_encodings:
            raise FaceNotRecognizedError("No registered faces in the system")

        known_encodings, student_ids = load_known_encodings(all_encodings)

        # Encode the query image
        image_array = decode_image_bytes(image_bytes)
        try:
            query_encoding = detect_and_encode_face(image_array)
        except FaceNotDetectedError:
            return RecognitionResult(matched=False)

        # Find best match
        match_index, confidence = find_best_match(
            query_encoding, known_encodings, tolerance=settings.FACE_RECOGNITION_TOLERANCE
        )

        if match_index is None:
            logger.info("Face recognition: no match found")
            return RecognitionResult(matched=False, confidence=confidence)

        student_id = student_ids[match_index]
        student = self.db.query(Student).filter(Student.id == student_id).first()
        if not student:
            return RecognitionResult(matched=False)

        logger.info(f"Face recognized: student_id={student_id} confidence={confidence:.3f}")
        return RecognitionResult(
            matched=True,
            student_id=student.id,
            student_name=student.full_name,
            enrollment_no=student.enrollment_no,
            confidence=round(confidence, 4),
        )

"""
Image utility helpers:
- Validate uploaded image content-type and size
- Save image bytes to a path safely
"""
import os
from pathlib import Path

from fastapi import UploadFile
from loguru import logger

from app.core.config import settings
from app.core.exceptions import BadRequestError, InternalServerError


def validate_image_upload(file: UploadFile) -> None:
    """
    Raise BadRequestError if the uploaded file is not an accepted image type
    or exceeds the configured maximum size.
    """
    if file.content_type not in settings.allowed_image_types_list:
        raise BadRequestError(
            f"Unsupported file type '{file.content_type}'. "
            f"Allowed: {', '.join(settings.allowed_image_types_list)}"
        )


async def read_upload_bytes(file: UploadFile) -> bytes:
    """Read all bytes from an UploadFile and validate size."""
    data = await file.read()
    if len(data) > settings.max_file_size_bytes:
        raise BadRequestError(
            f"File '{file.filename}' exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB} MB"
        )
    await file.seek(0)
    return data


def save_upload_file(data: bytes, destination: Path) -> Path:
    """
    Write *data* to *destination*, creating parent directories as needed.
    Returns the destination path.
    """
    try:
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(data)
        logger.debug(f"File saved: {destination}")
        return destination
    except OSError as exc:
        logger.error(f"Failed to save file {destination}: {exc}")
        raise InternalServerError("Failed to save uploaded file") from exc


def delete_file(path: str | Path) -> bool:
    """Delete a file from disk. Returns True on success, False if not found."""
    try:
        p = Path(path)
        if p.exists():
            p.unlink()
            return True
        return False
    except OSError as exc:
        logger.warning(f"Could not delete file {path}: {exc}")
        return False


def get_student_photo_dir(student_id: int) -> Path:
    """Return the upload directory for a student's photos."""
    return Path(settings.UPLOAD_DIR) / "students" / str(student_id)

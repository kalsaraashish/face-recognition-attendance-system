"""
Custom application exceptions.
Each maps to a specific HTTP status code and domain error category.
"""
from fastapi import HTTPException, status


class AppException(HTTPException):
    """Base application exception."""

    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)


# ── 400 Bad Request ───────────────────────────────────────────────────────────
class BadRequestError(AppException):
    def __init__(self, detail: str = "Bad request"):
        super().__init__(status.HTTP_400_BAD_REQUEST, detail)


class ValidationError(AppException):
    def __init__(self, detail: str = "Validation failed"):
        super().__init__(status.HTTP_422_UNPROCESSABLE_ENTITY, detail)


# ── 401 Unauthorized ──────────────────────────────────────────────────────────
class UnauthorizedError(AppException):
    def __init__(self, detail: str = "Authentication required"):
        super().__init__(status.HTTP_401_UNAUTHORIZED, detail)


class InvalidCredentialsError(AppException):
    def __init__(self, detail: str = "Invalid email or password"):
        super().__init__(status.HTTP_401_UNAUTHORIZED, detail)


# ── 403 Forbidden ─────────────────────────────────────────────────────────────
class ForbiddenError(AppException):
    def __init__(self, detail: str = "Access forbidden"):
        super().__init__(status.HTTP_403_FORBIDDEN, detail)


# ── 404 Not Found ─────────────────────────────────────────────────────────────
class NotFoundError(AppException):
    def __init__(self, resource: str = "Resource"):
        super().__init__(status.HTTP_404_NOT_FOUND, f"{resource} not found")


# ── 409 Conflict ──────────────────────────────────────────────────────────────
class ConflictError(AppException):
    def __init__(self, detail: str = "Resource already exists"):
        super().__init__(status.HTTP_409_CONFLICT, detail)


# ── 422 Unprocessable ─────────────────────────────────────────────────────────
class FaceNotDetectedError(AppException):
    def __init__(self, detail: str = "No face detected in the image"):
        super().__init__(status.HTTP_422_UNPROCESSABLE_ENTITY, detail)


class MultipleFacesError(AppException):
    def __init__(self, detail: str = "Multiple faces detected. Please upload an image with a single face"):
        super().__init__(status.HTTP_422_UNPROCESSABLE_ENTITY, detail)


class FaceNotRecognizedError(AppException):
    def __init__(self, detail: str = "Face not recognized"):
        super().__init__(status.HTTP_404_NOT_FOUND, detail)


# ── 500 Internal ─────────────────────────────────────────────────────────────
class InternalServerError(AppException):
    def __init__(self, detail: str = "Internal server error"):
        super().__init__(status.HTTP_500_INTERNAL_SERVER_ERROR, detail)

"""
Face processing utilities using OpenCV and the face_recognition library.

All functions operate on numpy arrays (RGB images) or raw bytes.
They raise structured application exceptions rather than raw library errors.
"""
import json
from typing import Optional

import cv2
import face_recognition
import numpy as np
from loguru import logger

from app.core.exceptions import FaceNotDetectedError, InternalServerError, MultipleFacesError


def decode_image_bytes(image_bytes: bytes) -> np.ndarray:
    """
    Decode raw image bytes into an RGB numpy array suitable for face_recognition.

    Args:
        image_bytes: Raw bytes from an uploaded image file.

    Returns:
        numpy ndarray with shape (H, W, 3) in RGB colour space.

    Raises:
        BadRequestError: If the bytes cannot be decoded as an image.
    """
    from app.core.exceptions import BadRequestError

    nparr = np.frombuffer(image_bytes, np.uint8)
    bgr_image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if bgr_image is None:
        raise BadRequestError("Could not decode image. Ensure the file is a valid JPEG or PNG.")
    # face_recognition expects RGB
    return cv2.cvtColor(bgr_image, cv2.COLOR_BGR2RGB)


def detect_and_encode_face(image: np.ndarray) -> np.ndarray:
    """
    Detect exactly one face in *image* and return its 128-d encoding.

    Raises:
        FaceNotDetectedError: If no face is found.
        MultipleFacesError:   If more than one face is detected.
        InternalServerError:  On unexpected library failure.
    """
    try:
        face_locations = face_recognition.face_locations(image, model="hog")
    except Exception as exc:
        logger.error(f"face_recognition.face_locations failed: {exc}")
        raise InternalServerError("Face detection failed") from exc

    if len(face_locations) == 0:
        raise FaceNotDetectedError()
    if len(face_locations) > 1:
        raise MultipleFacesError()

    try:
        encodings = face_recognition.face_encodings(image, face_locations)
    except Exception as exc:
        logger.error(f"face_recognition.face_encodings failed: {exc}")
        raise InternalServerError("Face encoding failed") from exc

    if not encodings:
        raise FaceNotDetectedError("Face detected but encoding failed")

    return encodings[0]  # shape (128,)


def load_known_encodings(
    face_encoding_rows: list,
) -> tuple[list[np.ndarray], list[int]]:
    """
    Deserialise stored FaceEncoding ORM objects into numpy arrays.

    Returns:
        Tuple of (list of encoding arrays, list of corresponding student_ids).
    """
    known_encodings: list[np.ndarray] = []
    student_ids: list[int] = []

    for row in face_encoding_rows:
        try:
            enc = np.array(json.loads(row.encoding_data), dtype=np.float64)
            known_encodings.append(enc)
            student_ids.append(row.student_id)
        except (json.JSONDecodeError, ValueError) as exc:
            logger.warning(f"Skipping malformed encoding id={row.id}: {exc}")

    return known_encodings, student_ids


def find_best_match(
    query_encoding: np.ndarray,
    known_encodings: list[np.ndarray],
    tolerance: float = 0.5,
) -> tuple[Optional[int], Optional[float]]:
    """
    Compare *query_encoding* against *known_encodings* and return
    (index_of_best_match, confidence).

    Confidence is defined as ``1 - distance`` so higher is better.

    Returns:
        (index, confidence) if match found within tolerance, else (None, best_confidence).
    """
    if not known_encodings:
        return None, None

    distances = face_recognition.face_distance(known_encodings, query_encoding)
    best_index = int(np.argmin(distances))
    best_distance = float(distances[best_index])
    confidence = round(1.0 - best_distance, 4)

    if best_distance <= tolerance:
        logger.debug(f"Face matched: index={best_index} distance={best_distance:.4f}")
        return best_index, confidence

    logger.debug(f"No match: best_distance={best_distance:.4f} > tolerance={tolerance}")
    return None, confidence

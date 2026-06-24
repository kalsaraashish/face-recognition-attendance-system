"""
FastAPI dependencies:
- Extract current user from JWT
- Role-based authorization guards
- Common DB dependency re-export
"""
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User, UserRole

# Bearer scheme — auto-generates "Authorize" button in Swagger UI
bearer_scheme = HTTPBearer(auto_error=True)


# ── Token extraction ──────────────────────────────────────────────────────────
def _get_token_payload(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """Extract and validate the JWT from the Authorization header."""
    try:
        return decode_access_token(credentials.credentials)
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


# ── Current user dependency ───────────────────────────────────────────────────
def get_current_user(
    payload: dict = Depends(_get_token_payload),
    db: Session = Depends(get_db),
) -> User:
    """
    Resolve the current authenticated user from the JWT payload.
    Raises 401 if user doesn't exist or is inactive.
    """
    user_id: Optional[str] = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing subject",
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    if not user.status:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled",
        )
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Alias for get_current_user (kept for semantic clarity)."""
    return current_user


# ── Role guards ───────────────────────────────────────────────────────────────
def _require_role(*roles: UserRole):
    """Factory that returns a dependency enforcing one of the given roles."""

    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {[r.value for r in roles]}",
            )
        return current_user

    return role_checker


require_admin = _require_role(UserRole.ADMIN)
require_faculty = _require_role(UserRole.FACULTY)
require_student = _require_role(UserRole.STUDENT)
require_admin_or_faculty = _require_role(UserRole.ADMIN, UserRole.FACULTY)
require_any_role = _require_role(UserRole.ADMIN, UserRole.FACULTY, UserRole.STUDENT)

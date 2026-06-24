"""
Authentication service.
Handles login, token refresh, password changes, and seeding the default admin.
"""
from loguru import logger
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import (
    ConflictError,
    InvalidCredentialsError,
    NotFoundError,
    UnauthorizedError,
    BadRequestError,
)
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_password,
    verify_password,
)
from app.models.user import User, UserRole
from app.schemas.auth import ChangePasswordRequest, LoginRequest, TokenResponse, UserOut


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    # ── Login ─────────────────────────────────────────────────────
    def login(self, payload: LoginRequest) -> TokenResponse:
        user = self.db.query(User).filter(User.email == payload.email).first()
        if not user or not verify_password(payload.password, user.password_hash):
            raise InvalidCredentialsError()
        if not user.status:
            raise UnauthorizedError("Account is disabled. Contact administrator.")

        access_token = create_access_token(str(user.id), user.role.value)
        refresh_token = create_refresh_token(str(user.id), user.role.value)
        logger.info(f"User {user.email} logged in successfully")

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserOut.model_validate(user),
        )

    # ── Refresh ───────────────────────────────────────────────────
    def refresh_token(self, refresh_token: str) -> TokenResponse:
        from jose import JWTError

        try:
            payload = decode_refresh_token(refresh_token)
        except JWTError:
            raise UnauthorizedError("Invalid or expired refresh token")

        user_id = payload.get("sub")
        user = self.db.query(User).filter(User.id == int(user_id)).first()
        if not user or not user.status:
            raise UnauthorizedError("User not found or disabled")

        access_token = create_access_token(str(user.id), user.role.value)
        new_refresh = create_refresh_token(str(user.id), user.role.value)

        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserOut.model_validate(user),
        )

    # ── Change Password ───────────────────────────────────────────
    def change_password(self, user: User, payload: ChangePasswordRequest) -> dict:
        if not verify_password(payload.current_password, user.password_hash):
            raise InvalidCredentialsError("Current password is incorrect")
        if payload.new_password != payload.confirm_password:
            raise BadRequestError("New password and confirmation do not match")
        if payload.new_password == payload.current_password:
            raise BadRequestError("New password must differ from the current password")

        user.password_hash = hash_password(payload.new_password)
        self.db.commit()
        logger.info(f"Password changed for user {user.email}")
        return {"message": "Password updated successfully"}

    # ── Seed Default Admin ────────────────────────────────────────
    def seed_admin(self) -> None:
        """Create the default admin user if it doesn't exist (called at startup)."""
        existing = self.db.query(User).filter(User.email == settings.DEFAULT_ADMIN_EMAIL).first()
        if existing:
            return
        admin = User(
            name=settings.DEFAULT_ADMIN_NAME,
            email=settings.DEFAULT_ADMIN_EMAIL,
            password_hash=hash_password(settings.DEFAULT_ADMIN_PASSWORD),
            role=UserRole.ADMIN,
            status=True,
        )
        self.db.add(admin)
        self.db.commit()
        logger.info(f"Default admin seeded: {settings.DEFAULT_ADMIN_EMAIL}")

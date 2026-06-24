"""
Database engine and session management using SQLAlchemy 2.0.
MySQL Workbench 8.0 CE compatible — handles charset, pool tuning,
and connect_args for stable long-running connections.
"""
from typing import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings


# ── MySQL 8.0 CE connect args ─────────────────────────────────────────────────
# connect_timeout  : seconds before giving up on a new connection
# read_timeout     : seconds before giving up on a read (important for
#                    large face-encoding JSON columns)
# write_timeout    : seconds before giving up on a write
# charset + collation ensure emoji/unicode support across the app
_CONNECT_ARGS = {
    "connect_timeout": 30,
    "read_timeout": 60,
    "write_timeout": 60,
    "charset": "utf8mb4",
}

# ── Engine ────────────────────────────────────────────────────────────────────
engine = create_engine(
    settings.DATABASE_URL,
    connect_args=_CONNECT_ARGS,
    pool_pre_ping=True,      # sends "SELECT 1" before each checkout to catch stale connections
    pool_size=10,            # number of persistent connections
    max_overflow=20,         # extra connections allowed beyond pool_size
    pool_recycle=1800,       # recycle connections every 30 min (avoids MySQL 8-hour timeout)
    pool_timeout=30,         # seconds to wait for a free connection from the pool
    echo=settings.DEBUG,     # log every SQL statement when DEBUG=True
)


# ── Session Factory ───────────────────────────────────────────────────────────
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,  # keeps ORM objects usable after commit (avoids lazy-load errors)
)


# ── Declarative Base ──────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    """Base class inherited by every ORM model."""
    pass


# ── FastAPI Dependency ────────────────────────────────────────────────────────
def get_db() -> Generator[Session, None, None]:
    """
    Yields a database session per request and guarantees cleanup.
    Usage:  db: Session = Depends(get_db)
    """
    db: Session = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


# ── Utilities ─────────────────────────────────────────────────────────────────
def create_tables() -> None:
    """Create all tables from ORM metadata (called at startup)."""
    Base.metadata.create_all(bind=engine)


def check_db_connection() -> bool:
    """Ping the database. Returns True if reachable, False otherwise."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False

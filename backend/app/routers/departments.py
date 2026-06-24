"""Departments router — full CRUD, Admin only for mutations."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_admin, require_any_role
from app.models.department import Department
from app.schemas.department import DepartmentCreate, DepartmentOut, DepartmentUpdate
from app.core.exceptions import ConflictError, NotFoundError

router = APIRouter(prefix="/departments", tags=["Departments"])


def _get_or_404(db: Session, dept_id: int) -> Department:
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise NotFoundError("Department")
    return dept


@router.post("", response_model=DepartmentOut, status_code=201, summary="Create department (Admin)")
def create_department(
    payload: DepartmentCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    if db.query(Department).filter(Department.name == payload.name).first():
        raise ConflictError(f"Department '{payload.name}' already exists")
    dept = Department(**payload.model_dump())
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept


@router.get("", response_model=list[DepartmentOut], summary="List all departments")
def list_departments(
    db: Session = Depends(get_db),
    _=Depends(require_any_role),
):
    return db.query(Department).all()


@router.get("/{dept_id}", response_model=DepartmentOut, summary="Get department by ID")
def get_department(
    dept_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_any_role),
):
    return _get_or_404(db, dept_id)


@router.put("/{dept_id}", response_model=DepartmentOut, summary="Update department (Admin)")
def update_department(
    dept_id: int,
    payload: DepartmentUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    dept = _get_or_404(db, dept_id)
    updates = payload.model_dump(exclude_unset=True)
    if "name" in updates and updates["name"] != dept.name:
        if db.query(Department).filter(Department.name == updates["name"]).first():
            raise ConflictError(f"Department name '{updates['name']}' already in use")
    for k, v in updates.items():
        setattr(dept, k, v)
    db.commit()
    db.refresh(dept)
    return dept


@router.delete("/{dept_id}", summary="Delete department (Admin)")
def delete_department(
    dept_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    dept = _get_or_404(db, dept_id)
    db.delete(dept)
    db.commit()
    return {"message": f"Department {dept_id} deleted"}

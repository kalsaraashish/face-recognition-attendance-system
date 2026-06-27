import sys
import argparse
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.student import Student

def create_student_user(email: str, password: str, name: str):
    db = SessionLocal()
    try:
        # Check if student exists in students table
        student = db.query(Student).filter(Student.email == email).first()
        if not student:
            print(f"Warning: No profile found in the 'students' table with email '{email}'.")
            print("Please ensure the student is added in the directory first so their attendance is linked.")
            if name is None:
                name = input("Enter student name: ")
        else:
            if name is None:
                name = student.full_name

        # Check if user already exists in users table
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"Error: A user account with email '{email}' already exists.")
            return

        # Create new student user
        new_user = User(
            name=name,
            email=email,
            password_hash=hash_password(password),
            role=UserRole.STUDENT,
            status=True
        )
        db.add(new_user)
        db.commit()
        print(f"Success! Student user created successfully.")
        print(f"Login details:")
        print(f"  Email: {email}")
        print(f"  Password: {password}")
        print(f"  Role: STUDENT")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create login credentials for a Student.")
    parser.add_argument("--email", required=True, help="Student email (must match profile email)")
    parser.add_argument("--password", required=True, help="Password for login")
    parser.add_argument("--name", default=None, help="Name of the student (optional if profile exists)")
    args = parser.parse_args()

    create_student_user(args.email, args.password, args.name)

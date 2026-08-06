from app.database import SessionLocal, Base, engine
from app import models
from app.utils.auth import hash_password

Base.metadata.create_all(bind=engine)

db = SessionLocal()

username = input("Username: ").strip()
password = input("Password: ").strip()
full_name = input("Full name (optional): ").strip() or None
role = input("Role (admin/staff) [admin]: ").strip() or "admin"

existing = db.query(models.User).filter(models.User.username == username).first()
if existing:
    print("That username already exists.")
else:
    user = models.User(
        username=username,
        hashed_password=hash_password(password),
        full_name=full_name,
        role=role,
    )
    db.add(user)
    db.commit()
    print(f"User '{username}' created with role '{role}'.")

db.close()
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..utils.auth import verify_password, create_access_token, get_current_user

from .. import models, schemas
from ..database import get_db
from ..utils.auth import (
    verify_password, create_access_token, get_current_user,
    verify_google_token, hash_password,
)
import secrets

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=schemas.TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account has been disabled")

    token = create_access_token({"sub": user.username, "role": user.role})

    return schemas.TokenResponse(access_token=token, user=user)


@router.get("/me", response_model=schemas.UserOut)
def read_current_user(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.post("/google", response_model=schemas.TokenResponse)
def google_login(payload: schemas.GoogleLoginRequest, db: Session = Depends(get_db)):
    try:
        idinfo = verify_google_token(payload.credential)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc))

    email = idinfo["email"]
    google_sub = idinfo["sub"]
    full_name = idinfo.get("name")

    user = db.query(models.User).filter(models.User.google_sub == google_sub).first()
    if not user:
        user = db.query(models.User).filter(models.User.email == email).first()

    if not user:
        user = models.User(
            username=email,
            hashed_password=hash_password(secrets.token_hex(32)),
            full_name=full_name,
            role="staff",
            email=email,
            google_sub=google_sub,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif not user.google_sub:
        user.google_sub = google_sub
        db.commit()

    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account has been disabled")

    token = create_access_token({"sub": user.username, "role": user.role})
    return schemas.TokenResponse(access_token=token, user=user)
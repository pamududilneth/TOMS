from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import secrets

from .. import models, schemas
from ..database import get_db
from ..utils.auth import (
    verify_password, 
    create_access_token, 
    get_current_user,
    verify_microsoft_token, 
    hash_password,
)

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


@router.post("/microsoft", response_model=schemas.TokenResponse)
def microsoft_login(payload: schemas.MicrosoftLoginRequest, db: Session = Depends(get_db)):
    try:
        claims = verify_microsoft_token(payload.id_token)
    except Exception as exc:
        raise HTTPException(status_code=401, detail=str(exc))
        
    email = claims.get("email") or claims.get("preferred_username")
    ms_sub = claims.get("oid") or claims.get("sub")
    full_name = claims.get("name")
    
    user = db.query(models.User).filter(models.User.google_sub == ms_sub).first()
    
    if not user:
        user = db.query(models.User).filter(models.User.email == email).first()
        
    if not user:
        user = models.User(
            username=email,
            hashed_password=hash_password(secrets.token_hex(32)),
            full_name=full_name,
            role="staff",
            email=email,
            google_sub=ms_sub,  # reusing the same column for the Microsoft object ID
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif not user.google_sub:
        user.google_sub = ms_sub
        db.commit()
        
    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account has been disabled")
        
    token = create_access_token({"sub": user.username, "role": user.role})
    
    return schemas.TokenResponse(access_token=token, user=user)
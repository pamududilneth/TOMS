import os
from datetime import datetime, timedelta
from jose import jwt as jose_jwt, JWTError  # Aliased to avoid clash with PyJWT
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from dotenv import load_dotenv

import secrets
import jwt  # PyJWT used for Microsoft SSO
from jwt import PyJWKClient

from .. import models
from ..database import get_db

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-only-fallback-key")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "480"))

# New Microsoft Entra ID Variables
ENTRA_TENANT_ID = os.getenv("ENTRA_TENANT_ID")
ENTRA_CLIENT_ID = os.getenv("ENTRA_CLIENT_ID")
_jwks_client = None

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    # Updated to use the aliased jose_jwt
    return jose_jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Updated to use the aliased jose_jwt
        payload = jose_jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None or not user.is_active:
        raise credentials_exception

    return user


def require_admin(user: models.User = Depends(get_current_user)) -> models.User:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# New Microsoft Token Verification Function
def verify_microsoft_token(id_token: str) -> dict:
    global _jwks_client
    if _jwks_client is None:
        jwks_url = f"https://login.microsoftonline.com/{ENTRA_TENANT_ID}/discovery/v2.0/keys"
        _jwks_client = PyJWKClient(jwks_url)
        
    signing_key = _jwks_client.get_signing_key_from_jwt(id_token)
    claims = jwt.decode(
        id_token,
        signing_key.key,
        algorithms=["RS256"],
        audience=ENTRA_CLIENT_ID,
        issuer=f"https://login.microsoftonline.com/{ENTRA_TENANT_ID}/v2.0",
    )
    
    if not claims.get("email") and not claims.get("preferred_username"):
        raise ValueError("Token did not include an email/username claim")
        
    return claims
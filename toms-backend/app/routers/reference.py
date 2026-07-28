from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db

router = APIRouter(prefix="/api", tags=["reference"])


@router.get("/clients")
def list_clients(q: str = "", db: Session = Depends(get_db)):
    query = db.query(models.Client)
    if q:
        query = query.filter(models.Client.name.ilike(f"%{q}%"))
    return [c.name for c in query.limit(20).all()]


@router.get("/coordinators")
def list_coordinators(db: Session = Depends(get_db)):
    return [c.name for c in db.query(models.Coordinator).all()]
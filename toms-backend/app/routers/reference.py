from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api", tags=["reference"])


@router.get("/clients")
def list_clients(q: str = "", db: Session = Depends(get_db)):
    query = db.query(models.Client)
    if q:
        query = query.filter(models.Client.name.ilike(f"%{q}%"))
    return [c.name for c in query.limit(20).all()]


@router.post("/clients", response_model=schemas.ClientOut)
def create_client(payload: schemas.ClientCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Client).filter(models.Client.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Client already exists")

    client = models.Client(name=payload.name)
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


@router.get("/coordinators")
def list_coordinators(db: Session = Depends(get_db)):
    return [c.name for c in db.query(models.Coordinator).all()]


@router.post("/coordinators", response_model=schemas.CoordinatorOut)
def create_coordinator(payload: schemas.CoordinatorCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Coordinator).filter(models.Coordinator.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Coordinator already exists")

    coordinator = models.Coordinator(name=payload.name, mobile_number=payload.mobile_number)
    db.add(coordinator)
    db.commit()
    db.refresh(coordinator)
    return coordinator
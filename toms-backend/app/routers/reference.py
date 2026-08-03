from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..utils.auth import require_admin
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api", tags=["reference"])


# ── Clients ──

@router.get("/clients")
def list_clients(q: str = "", db: Session = Depends(get_db)):
    query = db.query(models.Client)
    if q:
        query = query.filter(models.Client.name.ilike(f"%{q}%"))
    return [c.name for c in query.limit(20).all()]


@router.get("/clients/full", response_model=list[schemas.ClientFull])
def list_clients_full(db: Session = Depends(get_db)):
    return db.query(models.Client).order_by(models.Client.name).all()


@router.post("/clients", response_model=schemas.ClientFull)
def create_client(payload: schemas.ClientCreate, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    existing = db.query(models.Client).filter(models.Client.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Client already exists")

    client = models.Client(name=payload.name, email=payload.email)
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


@router.delete("/clients/{client_id}")
def delete_client(client_id: int, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    db.delete(client)
    db.commit()
    return {"deleted": True}



@router.get("/clients/{client_id}", response_model=schemas.ClientDetail)
def get_client_detail(client_id: int, db: Session = Depends(get_db)):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


# ── Coordinators ──

@router.get("/coordinators")
def list_coordinators(db: Session = Depends(get_db)):
    return [c.name for c in db.query(models.Coordinator).all()]


@router.get("/coordinators/full", response_model=list[schemas.CoordinatorOut])
def list_coordinators_full(db: Session = Depends(get_db)):
    return db.query(models.Coordinator).order_by(models.Coordinator.name).all()


@router.post("/coordinators", response_model=schemas.CoordinatorOut)
def create_coordinator(payload: schemas.CoordinatorCreate, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    existing = db.query(models.Coordinator).filter(models.Coordinator.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Coordinator already exists")

    coordinator = models.Coordinator(name=payload.name, mobile_number=payload.mobile_number)
    db.add(coordinator)
    db.commit()
    db.refresh(coordinator)
    return coordinator


@router.delete("/coordinators/{coordinator_id}")
def delete_coordinator(coordinator_id: int, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    coordinator = db.query(models.Coordinator).filter(models.Coordinator.id == coordinator_id).first()
    if not coordinator:
        raise HTTPException(status_code=404, detail="Coordinator not found")
    db.delete(coordinator)
    db.commit()
    return {"deleted": True}
import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..utils.excel_export import append_incident_row, EXCEL_PATH
from ..utils.client_share import share_incident_with_client
from ..utils.auth import require_admin

router = APIRouter(prefix="/api/incidents", tags=["incidents"])


def generate_request_id(db: Session) -> str:
    year = datetime.now().year
    # Look at the last inserted ID instead of the total count
    last_incident = db.query(models.Incident).order_by(models.Incident.id.desc()).first()
    next_count = (last_incident.id + 1) if last_incident else 1
    return f"REQ-{year}-{next_count:05d}"


# ── Static/literal routes must come BEFORE the dynamic /{incident_id} route ──

@router.get("/", response_model=list[schemas.IncidentOut])
def list_incidents(db: Session = Depends(get_db)):
    return db.query(models.Incident).order_by(models.Incident.id.desc()).all()


@router.get("/next-id")
def next_request_id(db: Session = Depends(get_db)):
    return {"request_id": generate_request_id(db)}


@router.get("/export/excel")
def export_excel():
    if not os.path.exists(EXCEL_PATH):
        raise HTTPException(status_code=404, detail="No incidents recorded yet")
    return FileResponse(
        EXCEL_PATH,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename="incidents.xlsx",
    )


@router.get("/debug/excel-path")
def debug_excel_path():
    return {"path": EXCEL_PATH, "exists": os.path.exists(EXCEL_PATH)}


@router.post("/", response_model=schemas.IncidentOut)
def create_incident(payload: schemas.IncidentCreate, db: Session = Depends(get_db)):
    data = payload.model_dump()
    client_ids = data.pop("client_ids", [])

    incident = models.Incident(
        request_id=generate_request_id(db),
        **data,
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)

    try:
        append_incident_row(incident)
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc))

    if client_ids:
        clients = db.query(models.Client).filter(models.Client.id.in_(client_ids)).all()
        incident.shared_clients = clients
        db.commit()

        for client in clients:
            try:
                share_incident_with_client(client, incident, db)
            except RuntimeError as exc:
                raise HTTPException(status_code=409, detail=str(exc))

    return incident


# ── Dynamic routes stay LAST ──

@router.get("/{incident_id}", response_model=schemas.IncidentOut)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@router.patch("/{incident_id}", response_model=schemas.IncidentOut)
def update_incident(incident_id: int, payload: schemas.IncidentUpdate, db: Session = Depends(get_db)):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(incident, field, value)

    db.commit()
    db.refresh(incident)
    return incident


@router.delete("/{incident_id}")
def delete_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    db.delete(incident)
    db.commit()
    return {"deleted": True}
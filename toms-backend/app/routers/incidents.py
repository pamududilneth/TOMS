import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..utils.excel_export import append_incident_row, EXCEL_PATH
from ..utils.client_share import share_incident_with_client, remove_incident_from_client_sheet
from ..utils.google_sheets_client import append_master_incident_row, delete_master_incident_row
from ..utils.auth import require_admin, get_current_user

router = APIRouter(prefix="/api/incidents", tags=["incidents"])


def generate_request_id(db: Session) -> str:
    year = datetime.now().year
    last_incident = db.query(models.Incident).order_by(models.Incident.id.desc()).first()
    next_count = (last_incident.id + 1) if last_incident else 1
    return f"REQ-{year}-{next_count:05d}"


def _visible_query(db: Session, current_user: models.User):
    query = db.query(models.Incident)
    if current_user.role != "admin":
        query = query.filter(models.Incident.owner_id == current_user.id)
    return query


@router.get("/", response_model=list[schemas.IncidentOut])
def list_incidents(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return _visible_query(db, current_user).order_by(models.Incident.id.desc()).all()


@router.get("/next-id")
def next_request_id(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return {"request_id": generate_request_id(db)}


@router.get("/export/excel")
def export_excel(current_user: models.User = Depends(get_current_user)):
    if not os.path.exists(EXCEL_PATH):
        raise HTTPException(status_code=404, detail="No incidents recorded yet")
    return FileResponse(
        EXCEL_PATH,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename="incidents.xlsx",
    )


@router.post("/", response_model=schemas.IncidentOut)
def create_incident(
    payload: schemas.IncidentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    data = payload.model_dump()
    client_ids = data.pop("client_ids", [])

    incident = models.Incident(
        request_id=generate_request_id(db),
        owner_id=current_user.id,
        **data,
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)

    try:
        append_incident_row(incident)
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc))

    row_data = [
        incident.request_id,
        incident.vehicle_number,
        incident.driver_name,
        incident.driver_contact_number,
        incident.assigned_coordinator,
        incident.coordinator_mobile_number,
        incident.driver_contacted,
        incident.driver_feedback,
        "Yes" if incident.vehicle_parked else "No",
        incident.current_parking_location,
        incident.parked_time,
        incident.pickup_location,
        incident.via_locations,
        incident.delivery_location,
        incident.approver,
    ]
    try:
        append_master_incident_row(row_data)
    except Exception as exc:
        print(f"[create_incident] Google Sheets sync failed (expected until SharePoint migration): {exc}")

    if client_ids:
        clients = db.query(models.Client).filter(models.Client.id.in_(client_ids)).all()
        incident.shared_clients = clients
        db.commit()
        for client in clients:
            try:
                share_incident_with_client(client, incident, db)
            except Exception as exc:
                print(f"[create_incident] Client share failed (expected until SharePoint migration): {exc}")

    return incident


@router.get("/{incident_id}", response_model=schemas.IncidentOut)
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    incident = _visible_query(db, current_user).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@router.patch("/{incident_id}", response_model=schemas.IncidentOut)
def update_incident(
    incident_id: int,
    payload: schemas.IncidentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    incident = _visible_query(db, current_user).filter(models.Incident.id == incident_id).first()
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

    shared_clients = list(incident.shared_clients)
    request_id = incident.request_id

    db.delete(incident)
    db.commit()

    try:
        delete_master_incident_row(request_id)
    except Exception as exc:
        print(f"[delete_incident] Master sheet sync failed: {exc}")

    for client in shared_clients:
        try:
            remove_incident_from_client_sheet(client.name, request_id)
        except Exception as exc:
            print(f"[delete_incident] Client sheet sync failed for {client.name}: {exc}")

    return {"deleted": True}
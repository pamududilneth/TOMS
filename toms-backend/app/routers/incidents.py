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
    count = db.query(models.Incident).count() + 1
    return f"VSR{count:03d}"


def _attach_display_names(incident: models.Incident, db: Session) -> models.Incident:
    owner = db.query(models.User).filter(models.User.id == incident.owner_id).first()
    incident.owner_name = (owner.full_name or owner.username) if owner else None
    
    if incident.customer_id:
        customer = db.query(models.Client).filter(models.Client.id == incident.customer_id).first()
        incident.customer_name = customer.name if customer else None
    else:
        incident.customer_name = None
        
    return incident


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
    incidents = _visible_query(db, current_user).order_by(models.Incident.id.desc()).all()
    return [_attach_display_names(i, db) for i in incidents]


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

    # We must resolve these names before hitting Excel so the 23-column export works
    customer_name = ""
    if data.get("customer_id"):
        customer = db.query(models.Client).filter(models.Client.id == data["customer_id"]).first()
        if customer:
            customer_name = customer.name

    username = current_user.full_name or current_user.username

    incident = models.Incident(
        owner_id=current_user.id,
        **data,
    )
    
    db.add(incident)
    db.flush()  # Assigns incident.id without committing the transaction yet
    
    incident.request_id = f"VSR{incident.id:03d}"

    try:
        append_incident_row(incident, username=username, customer_name=customer_name)
    except RuntimeError as exc:
        db.rollback()  # Undo the flush — nothing gets saved to the DB if Excel fails
        raise HTTPException(status_code=409, detail=str(exc))

    db.commit()
    db.refresh(incident)

    # Everything below only runs after both DB + Excel succeeded
    row_data = [
        incident.request_id,
        username,
        incident.created_at.strftime("%Y-%m-%d") if incident.created_at else "",
        incident.created_at.strftime("%H:%M") if incident.created_at else "",
        customer_name,
        incident.stop_category,
        incident.job_no,
        incident.vehicle_number,
        incident.driver_name,
        incident.driver_contact_number,
        incident.assigned_coordinator,
        incident.coordinator_mobile_number,
        incident.driver_contacted,
        incident.driver_feedback,
        "Yes" if incident.vehicle_parked else "No",
        incident.current_parking_location,
        incident.stopped_date,
        incident.stopped_time,
        f"{incident.stopped_date} {incident.stopped_time}" if incident.stopped_date else "",
        incident.pickup_location,
        incident.via_locations,
        incident.delivery_location,
        incident.duration,
    ]

    try:
        append_master_incident_row(row_data)
    except Exception as exc:
        print(f"[create_incident] Google Sheets sync failed: {exc}")

    if client_ids:
        clients = db.query(models.Client).filter(models.Client.id.in_(client_ids)).all()
        incident.shared_clients = clients
        db.commit()
        for client in clients:
            try:
                share_incident_with_client(client, incident, db, username=username, customer_name=customer_name)
            except Exception as exc:
                print(f"[create_incident] Client share failed: {exc}")

    return _attach_display_names(incident, db)


@router.get("/{incident_id}", response_model=schemas.IncidentOut)
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    incident = _visible_query(db, current_user).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    return _attach_display_names(incident, db)


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
    
    return _attach_display_names(incident, db)


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
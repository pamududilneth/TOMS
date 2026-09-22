

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..utils.breakdown_excel_export import append_breakdown_row as append_breakdown_row_local
from ..utils.google_sheets_client import append_breakdown_row as append_breakdown_row_sheets, delete_breakdown_row
from ..utils.auth import require_admin, get_current_user

router = APIRouter(prefix="/api/breakdowns", tags=["breakdowns"])


def _visible_query(db: Session, current_user: models.User):
    query = db.query(models.Breakdown)
    if current_user.role != "admin":
        query = query.filter(models.Breakdown.owner_id == current_user.id)
    return query


def _month_label(dt: datetime) -> str:
    return dt.strftime("%B-%Y")

# digit fix

def _time_for_reporting(incident_dt: datetime, reported_dt: datetime) -> str:
    delta = reported_dt - incident_dt
    total_seconds = int(delta.total_seconds())
    if total_seconds < 0:
        return "N/A"
    hours, rem = divmod(total_seconds, 3600)
    minutes, seconds = divmod(rem, 60)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}"


def _attach_display_fields(breakdown: models.Breakdown, db: Session) -> models.Breakdown:
    owner = db.query(models.User).filter(models.User.id == breakdown.owner_id).first()
    breakdown.owner_name = (owner.full_name or owner.username) if owner else None

    customer = db.query(models.Client).filter(models.Client.id == breakdown.customer_id).first() if breakdown.customer_id else None
    breakdown.customer_name = customer.name if customer else None

    supplier = db.query(models.Supplier).filter(models.Supplier.id == breakdown.supplier_id).first() if breakdown.supplier_id else None
    breakdown.supplier_name = supplier.name if supplier else None

    incident_dt = None
    if breakdown.incident_datetime:
        try:
            incident_dt = datetime.fromisoformat(breakdown.incident_datetime)
        except ValueError:
            incident_dt = None

    reported_dt = breakdown.created_at

    breakdown.incident_month = _month_label(incident_dt) if incident_dt else None
    breakdown.reported_month = _month_label(reported_dt) if reported_dt else None
    breakdown.time_for_reporting = (
        _time_for_reporting(incident_dt, reported_dt) if incident_dt and reported_dt else None
    )

    return breakdown


@router.get("/next-id")
def next_job_number(db: Session = Depends(get_db)):
    last = db.query(models.Breakdown).order_by(models.Breakdown.id.desc()).first()
    next_num = (last.id + 1) if last else 1
    return {"job_number": f"BDA{next_num:03d}"}


@router.get("/", response_model=list[schemas.BreakdownOut])
def list_breakdowns(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    breakdowns = _visible_query(db, current_user).order_by(models.Breakdown.id.desc()).all()
    return [_attach_display_fields(b, db) for b in breakdowns]


@router.post("/", response_model=schemas.BreakdownOut)
def create_breakdown(
    payload: schemas.BreakdownCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    data = payload.model_dump()

    breakdown = models.Breakdown(
        owner_id=current_user.id,
        **data,
    )
    db.add(breakdown)
    db.flush()
    breakdown.job_number = f"BDA{breakdown.id:03d}"

    customer = db.query(models.Client).filter(models.Client.id == breakdown.customer_id).first() if breakdown.customer_id else None
    supplier = db.query(models.Supplier).filter(models.Supplier.id == breakdown.supplier_id).first() if breakdown.supplier_id else None
    username = current_user.full_name or current_user.username

    incident_dt = None
    if breakdown.incident_datetime:
        try:
            incident_dt = datetime.fromisoformat(breakdown.incident_datetime)
        except ValueError:
            incident_dt = None

    reported_dt = datetime.now()
    incident_month = _month_label(incident_dt) if incident_dt else ""
    reported_month = _month_label(reported_dt)
    time_for_reporting = _time_for_reporting(incident_dt, reported_dt) if incident_dt else ""

    try:
        append_breakdown_row_local(
            breakdown,
            username=username,
            customer_name=customer.name if customer else "",
            supplier_name=supplier.name if supplier else "",
            incident_dt=incident_dt,
            reported_dt=reported_dt,
            incident_month=incident_month,
            reported_month=reported_month,
            time_for_reporting=time_for_reporting,
        )
    except RuntimeError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail=str(exc))

    db.commit()
    db.refresh(breakdown)

    row_data = [
        breakdown.job_number, username,
        incident_dt.strftime("%Y-%m-%d %H:%M:%S") if incident_dt else "",
        incident_month,
        reported_dt.strftime("%Y-%m-%d %H:%M:%S"),
        reported_month, time_for_reporting,
        breakdown.job_no, "",
        customer.name if customer else "",
        breakdown.vehicle_number, breakdown.vehicle_type, breakdown.driver,
        supplier.name if supplier else "",
        breakdown.category, breakdown.category_detail, breakdown.injury_category,
        breakdown.root_cause, breakdown.shipment_content, breakdown.third_party_life,
        breakdown.driver_assistant_life, breakdown.vehicle_impact, breakdown.third_party_property,
        breakdown.delivery_on_time, "TBA", "TBA", "TBA",
        breakdown.involvement_of_police, breakdown.legal_impact,
        "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "",
    ]
    try:
        append_breakdown_row_sheets(row_data)
    except Exception as exc:
        print(f"[create_breakdown] Google Sheets sync failed: {exc}")

    return _attach_display_fields(breakdown, db)


@router.get("/{breakdown_id}", response_model=schemas.BreakdownOut)
def get_breakdown(
    breakdown_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    breakdown = _visible_query(db, current_user).filter(models.Breakdown.id == breakdown_id).first()
    if not breakdown:
        raise HTTPException(status_code=404, detail="Breakdown not found")
    return _attach_display_fields(breakdown, db)


@router.patch("/{breakdown_id}", response_model=schemas.BreakdownOut)
def update_breakdown(
    breakdown_id: int,
    payload: schemas.BreakdownUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    breakdown = _visible_query(db, current_user).filter(models.Breakdown.id == breakdown_id).first()
    if not breakdown:
        raise HTTPException(status_code=404, detail="Breakdown not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(breakdown, field, value)

    db.commit()
    db.refresh(breakdown)
    return _attach_display_fields(breakdown, db)


@router.delete("/{breakdown_id}")
def delete_breakdown(
    breakdown_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    breakdown = db.query(models.Breakdown).filter(models.Breakdown.id == breakdown_id).first()
    if not breakdown:
        raise HTTPException(status_code=404, detail="Breakdown not found")

    job_number = breakdown.job_number
    db.delete(breakdown)
    db.commit()

    try:
        delete_breakdown_row(job_number)
    except Exception as exc:
        print(f"[delete_breakdown] Sheet sync failed: {exc}")

    return {"deleted": True}
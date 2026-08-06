import os
import shutil
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..utils.breakdown_excel_export import append_breakdown_row, EXCEL_PATH

router = APIRouter(prefix="/api/breakdowns", tags=["breakdowns"])

UPLOAD_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads", "breakdowns"
)


def generate_job_number(db: Session) -> str:
    year = datetime.now().year
    count = db.query(models.Breakdown).count() + 1
    return f"JOB-{year}-{count:04d}"


# ── Static/literal routes must come BEFORE the dynamic /{breakdown_id} route ──

@router.get("/next-id")
def next_job_number(db: Session = Depends(get_db)):
    return {"job_number": generate_job_number(db)}


@router.get("/export/excel")
def export_excel():
    if not os.path.exists(EXCEL_PATH):
        raise HTTPException(status_code=404, detail="No breakdowns recorded yet")
    return FileResponse(
        EXCEL_PATH,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename="breakdowns.xlsx",
    )


@router.get("/debug/excel-path")
def debug_excel_path():
    return {"path": EXCEL_PATH, "exists": os.path.exists(EXCEL_PATH)}


@router.get("/uploads/{filename}")
def get_uploaded_image(filename: str):
    path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(path)


@router.get("/", response_model=list[schemas.BreakdownOut])
def list_breakdowns(db: Session = Depends(get_db)):
    return db.query(models.Breakdown).order_by(models.Breakdown.id.desc()).all()


@router.post("/", response_model=schemas.BreakdownOut)
def create_breakdown(
    vehicle_number: str = Form(...),
    requesting_plant: str = Form(""),
    pickup_location: str = Form(""),
    via_location: str = Form(""),
    delivery_location: str = Form(""),
    incident_type: str = Form("Breakdown"),
    incident_datetime: str = Form(""),
    location: str = Form(""),
    reason: str = Form(""),
    action_taken: str = Form(""),
    priority: str = Form("High Intervention"),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    job_number = generate_job_number(db)

    image_filename = None
    if image and image.filename:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        ext = os.path.splitext(image.filename)[1]
        image_filename = f"{job_number}{ext}"
        dest_path = os.path.join(UPLOAD_DIR, image_filename)
        with open(dest_path, "wb") as f:
            shutil.copyfileobj(image.file, f)

    breakdown = models.Breakdown(
        job_number=job_number,
        vehicle_number=vehicle_number,
        requesting_plant=requesting_plant,
        pickup_location=pickup_location,
        via_location=via_location,
        delivery_location=delivery_location,
        incident_type=incident_type,
        incident_datetime=incident_datetime,
        location=location,
        reason=reason,
        action_taken=action_taken,
        priority=priority,
        image_filename=image_filename,
        status="submitted",
    )
    db.add(breakdown)
    db.commit()
    db.refresh(breakdown)

    try:
        append_breakdown_row(breakdown)
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc))

    return breakdown


# ── Dynamic routes stay LAST ──

@router.get("/{breakdown_id}", response_model=schemas.BreakdownOut)
def get_breakdown(breakdown_id: int, db: Session = Depends(get_db)):
    breakdown = db.query(models.Breakdown).filter(models.Breakdown.id == breakdown_id).first()
    if not breakdown:
        raise HTTPException(status_code=404, detail="Breakdown not found")
    return breakdown


@router.patch("/{breakdown_id}", response_model=schemas.BreakdownOut)
def update_breakdown(
    breakdown_id: int,
    payload: schemas.BreakdownUpdate,
    db: Session = Depends(get_db),
):
    breakdown = db.query(models.Breakdown).filter(models.Breakdown.id == breakdown_id).first()
    if not breakdown:
        raise HTTPException(status_code=404, detail="Breakdown not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(breakdown, field, value)

    db.commit()
    db.refresh(breakdown)
    return breakdown


@router.post("/{breakdown_id}/image", response_model=schemas.BreakdownOut)
def replace_breakdown_image(
    breakdown_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    breakdown = db.query(models.Breakdown).filter(models.Breakdown.id == breakdown_id).first()
    if not breakdown:
        raise HTTPException(status_code=404, detail="Breakdown not found")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(image.filename)[1]
    image_filename = f"{breakdown.job_number}{ext}"
    dest_path = os.path.join(UPLOAD_DIR, image_filename)
    with open(dest_path, "wb") as f:
        shutil.copyfileobj(image.file, f)

    breakdown.image_filename = image_filename
    db.commit()
    db.refresh(breakdown)
    return breakdown


@router.delete("/{breakdown_id}")
def delete_breakdown(breakdown_id: int, db: Session = Depends(get_db)):
    breakdown = db.query(models.Breakdown).filter(models.Breakdown.id == breakdown_id).first()
    if not breakdown:
        raise HTTPException(status_code=404, detail="Breakdown not found")
    db.delete(breakdown)
    db.commit()
    return {"deleted": True}
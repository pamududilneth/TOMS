from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/dashboard", response_model=schemas.DashboardStats)
def dashboard_stats(db: Session = Depends(get_db)):
    active_stops = (
        db.query(models.Incident)
        .filter(models.Incident.status == "submitted")
        .filter(models.Incident.vehicle_parked == False)  # noqa: E712
        .count()
    )

    today_start = datetime.combine(datetime.today(), datetime.min.time())

    todays_breakdowns = (
        db.query(models.Breakdown)
        .filter(models.Breakdown.created_at >= today_start)
        .count()
    )

    total_clients = db.query(models.Client).count()

    return schemas.DashboardStats(
        active_stops=active_stops,
        todays_breakdowns=todays_breakdowns,
        total_clients=total_clients,
    )


@router.get("/recent-activity")
def recent_activity(limit: int = 6, db: Session = Depends(get_db)):
    incidents = (
        db.query(models.Incident)
        .order_by(models.Incident.id.desc())
        .limit(limit)
        .all()
    )
    breakdowns = (
        db.query(models.Breakdown)
        .order_by(models.Breakdown.id.desc())
        .limit(limit)
        .all()
    )

    items = []

    for i in incidents:
        items.append({
            "type": "incident",
            "id": i.id,
            "reference": i.request_id,
            "title": f"Unplanned stop — {i.vehicle_number}",
            "subtitle": i.driver_name,
            "status": i.status,
            "created_at": i.created_at.isoformat() if i.created_at else None,
        })

    for b in breakdowns:
        items.append({
            "type": "breakdown",
            "id": b.id,
            "reference": b.job_number,
            "title": f"{b.incident_type} — {b.vehicle_number}",
            "subtitle": b.requesting_plant,
            "status": b.status,
            "created_at": b.created_at.isoformat() if b.created_at else None,
        })

    items.sort(key=lambda x: x["created_at"] or "", reverse=True)

    return items[:limit]
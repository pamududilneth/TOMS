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
        db.query(models.Incident)
        .filter(models.Incident.created_at >= today_start)
        .count()
    )

    total_clients = db.query(models.Client).count()

    return schemas.DashboardStats(
        active_stops=active_stops,
        todays_breakdowns=todays_breakdowns,
        total_clients=total_clients,
    )
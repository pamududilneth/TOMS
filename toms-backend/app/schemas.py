from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class IncidentBase(BaseModel):
    vehicle_number: str
    driver_name: str
    driver_contact_number: str
    assigned_coordinator: Optional[str] = None
    coordinator_mobile_number: Optional[str] = None
    current_parking_location: Optional[str] = None
    parked_time: Optional[str] = None
    pickup_location: Optional[str] = None
    via_locations: Optional[str] = None
    delivery_location: Optional[str] = None
    driver_contacted: str = "Yes"
    driver_feedback: Optional[str] = None
    vehicle_parked: bool = False
    approver: Optional[str] = None
    client_name: Optional[str] = None
    status: str = "submitted"


class IncidentCreate(IncidentBase):
    pass


class IncidentUpdate(BaseModel):
    vehicle_number: Optional[str] = None
    driver_name: Optional[str] = None
    driver_contact_number: Optional[str] = None
    assigned_coordinator: Optional[str] = None
    coordinator_mobile_number: Optional[str] = None
    current_parking_location: Optional[str] = None
    parked_time: Optional[str] = None
    pickup_location: Optional[str] = None
    via_locations: Optional[str] = None
    delivery_location: Optional[str] = None
    driver_contacted: Optional[str] = None
    driver_feedback: Optional[str] = None
    vehicle_parked: Optional[bool] = None
    approver: Optional[str] = None
    client_name: Optional[str] = None
    status: Optional[str] = None


class IncidentOut(IncidentBase):
    id: int
    request_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    active_stops: int
    todays_breakdowns: int
    total_clients: int
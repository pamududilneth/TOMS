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
    client_ids: list[int] = []


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


class ClientCreate(BaseModel):
    name: str
    email: Optional[str] = None

class ClientFull(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    first_shared_at: Optional[datetime] = None
    share_link: Optional[str] = None

    class Config:
        from_attributes = True



class ClientDetail(ClientFull):
    incidents: list[IncidentOut] = []



class ClientOut(ClientCreate):
    id: int

    class Config:
        from_attributes = True


class CoordinatorCreate(BaseModel):
    name: str
    mobile_number: Optional[str] = None


class CoordinatorOut(CoordinatorCreate):
    id: int

    class Config:
        from_attributes = True


class BreakdownBase(BaseModel):
    vehicle_number: str
    requesting_plant: Optional[str] = None
    pickup_location: Optional[str] = None
    via_location: Optional[str] = None
    delivery_location: Optional[str] = None
    incident_type: str = "Breakdown"
    incident_datetime: Optional[str] = None
    location: Optional[str] = None
    reason: Optional[str] = None
    action_taken: Optional[str] = None
    priority: str = "High Intervention"
    status: str = "submitted"

class BreakdownUpdate(BaseModel):
    vehicle_number: Optional[str] = None
    requesting_plant: Optional[str] = None
    pickup_location: Optional[str] = None
    via_location: Optional[str] = None
    delivery_location: Optional[str] = None
    incident_type: Optional[str] = None
    incident_datetime: Optional[str] = None
    location: Optional[str] = None
    reason: Optional[str] = None
    action_taken: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None


class BreakdownOut(BreakdownBase):
    id: int
    job_number: str
    image_filename: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    role: str
    is_active: bool
    email: Optional[str] = None

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: Optional[str] = None
    role: str = "staff"


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class GoogleLoginRequest(BaseModel):
    credential: str
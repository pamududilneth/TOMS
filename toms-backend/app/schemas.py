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
    pickup_location: Optional[str] = None
    via_locations: Optional[str] = None
    delivery_location: Optional[str] = None
    driver_contacted: str = "Yes"
    driver_feedback: Optional[str] = None
    vehicle_parked: bool = False
    status: str = "submitted"

    customer_id: Optional[int] = None
    stop_category: Optional[str] = None
    job_no: Optional[str] = None
    stopped_date: Optional[str] = None
    stopped_time: Optional[str] = None
    duration: Optional[str] = None


class IncidentCreate(IncidentBase):
    client_ids: list[int] = []


class IncidentUpdate(BaseModel):
    vehicle_number: Optional[str] = None
    driver_name: Optional[str] = None
    driver_contact_number: Optional[str] = None
    assigned_coordinator: Optional[str] = None
    coordinator_mobile_number: Optional[str] = None
    current_parking_location: Optional[str] = None
    pickup_location: Optional[str] = None
    via_locations: Optional[str] = None
    delivery_location: Optional[str] = None
    driver_contacted: Optional[str] = None
    driver_feedback: Optional[str] = None
    vehicle_parked: Optional[bool] = None
    status: Optional[str] = None
    customer_id: Optional[int] = None
    stop_category: Optional[str] = None
    job_no: Optional[str] = None
    stopped_date: Optional[str] = None
    stopped_time: Optional[str] = None
    duration: Optional[str] = None


class IncidentOut(IncidentBase):
    id: int
    request_id: str
    owner_id: Optional[int] = None
    owner_name: Optional[str] = None
    customer_name: Optional[str] = None
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


# ---> REPLACED BREAKDOWN SCHEMAS
class BreakdownBase(BaseModel):
    incident_datetime: Optional[str] = None
    job_no: Optional[str] = None
    customer_id: Optional[int] = None
    vehicle_number: str
    driver: Optional[str] = None
    supplier_id: Optional[int] = None
    category: Optional[str] = None
    category_detail: Optional[str] = None
    injury_category: Optional[str] = None
    root_cause: Optional[str] = None
    shipment_content: Optional[str] = None
    third_party_life: Optional[str] = None
    driver_assistant_life: Optional[str] = None
    vehicle_impact: Optional[str] = None
    third_party_property: Optional[str] = None
    delivery_on_time: Optional[str] = None
    involvement_of_police: Optional[str] = None
    legal_impact: Optional[str] = None
    status: str = "submitted"


class BreakdownCreate(BreakdownBase):
    pass


class BreakdownUpdate(BaseModel):
    incident_datetime: Optional[str] = None
    job_no: Optional[str] = None
    customer_id: Optional[int] = None
    vehicle_number: Optional[str] = None
    driver: Optional[str] = None
    supplier_id: Optional[int] = None
    category: Optional[str] = None
    category_detail: Optional[str] = None
    injury_category: Optional[str] = None
    root_cause: Optional[str] = None
    shipment_content: Optional[str] = None
    third_party_life: Optional[str] = None
    driver_assistant_life: Optional[str] = None
    vehicle_impact: Optional[str] = None
    third_party_property: Optional[str] = None
    delivery_on_time: Optional[str] = None
    involvement_of_police: Optional[str] = None
    legal_impact: Optional[str] = None
    status: Optional[str] = None


class BreakdownOut(BreakdownBase):
    id: int
    job_number: str  # Record ID
    owner_id: Optional[int] = None
    owner_name: Optional[str] = None
    customer_name: Optional[str] = None
    supplier_name: Optional[str] = None
    incident_month: Optional[str] = None
    reported_month: Optional[str] = None
    time_for_reporting: Optional[str] = None
    created_at: datetime
    image_filename: Optional[str] = None  # Kept to ensure uploaded images still display on frontend!

    class Config:
        from_attributes = True


# ---> NEW SUPPLIER SCHEMAS
class SupplierCreate(BaseModel):
    name: str

class SupplierOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class StopCategoryCreate(BaseModel):
    name: str


class StopCategoryOut(BaseModel):
    id: int
    name: str

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


class MicrosoftLoginRequest(BaseModel):
    id_token: str
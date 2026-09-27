from sqlalchemy import Column, Integer, String, Boolean, DateTime, func, Table, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

# 1. Define the association table FIRST
incident_clients = Table(
    "incident_clients",
    Base.metadata,
    Column("incident_id", Integer, ForeignKey("incidents.id"), primary_key=True),
    Column("client_id", Integer, ForeignKey("clients.id"), primary_key=True)
)

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String, unique=True, index=True)
    vehicle_number = Column(String, nullable=False)

    driver_name = Column(String, nullable=False)
    driver_contact_number = Column(String, nullable=False)
    assigned_coordinator = Column(String, nullable=True)
    coordinator_mobile_number = Column(String, nullable=True)

    current_parking_location = Column(String, nullable=True)
    parked_time = Column(String, nullable=True)
    pickup_location = Column(String, nullable=True)
    via_locations = Column(String, nullable=True)
    delivery_location = Column(String, nullable=True)

    driver_contacted = Column(String, default="Yes")
    driver_feedback = Column(String, nullable=True)
    vehicle_parked = Column(Boolean, default=False)

    approver = Column(String, nullable=True)
    client_name = Column(String, nullable=True)

    # ---> NEW COLUMNS ADDED HERE
    customer_id = Column(Integer, ForeignKey("clients.id"), nullable=True)
    stop_category = Column(String, nullable=True)
    job_no = Column(String, nullable=True)
    stopped_date = Column(String, nullable=True)
    stopped_time = Column(String, nullable=True)
    duration = Column(String, nullable=True)

    status = Column(String, default="submitted")  # draft | submitted
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # 2. Add the reverse relationship so Client can back_populate
    shared_clients = relationship(
        "Client", secondary=incident_clients, back_populates="incidents"
    )

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    email = Column(String, nullable=True)
    first_shared_at = Column(DateTime(timezone=True), nullable=True)
    share_link = Column(String, nullable=True)

    incidents = relationship(
        "Incident", secondary=incident_clients, back_populates="shared_clients"
    )

class Coordinator(Base):
    __tablename__ = "coordinators"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    mobile_number = Column(String, nullable=True)

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

class Breakdown(Base):
    __tablename__ = "breakdowns"

    id = Column(Integer, primary_key=True, index=True)
    job_number = Column(String, unique=True, index=True)
    vehicle_number = Column(String, nullable=False)
    requesting_plant = Column(String, nullable=True)

    pickup_location = Column(String, nullable=True)
    via_location = Column(String, nullable=True)
    delivery_location = Column(String, nullable=True)

    incident_type = Column(String, default="Breakdown")  # Breakdown | Accident
    incident_datetime = Column(String, nullable=True)
    
    # ---> NEW COLUMNS EXTENDING BREAKDOWN
    job_no = Column(String, nullable=True)
    customer_id = Column(Integer, ForeignKey("clients.id"), nullable=True)
    driver = Column(String, nullable=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    category = Column(String, nullable=True)
    category_detail = Column(String, nullable=True)
    injury_category = Column(String, nullable=True)
    root_cause = Column(String, nullable=True)
    shipment_content = Column(String, nullable=True)
    third_party_life = Column(String, nullable=True)
    driver_assistant_life = Column(String, nullable=True)
    vehicle_impact = Column(String, nullable=True)
    third_party_property = Column(String, nullable=True)
    delivery_on_time = Column(String, nullable=True)
    involvement_of_police = Column(String, nullable=True)
    legal_impact = Column(String, nullable=True)

    vehicle_type = Column(String, nullable=True) # add vehicle type

    location = Column(String, nullable=True)  # where the breakdown/accident happened
    reason = Column(String, nullable=True)

    image_filename = Column(String, nullable=True)

    action_taken = Column(String, nullable=True)
    priority = Column(String, default="High Intervention")

    status = Column(String, default="submitted")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)

class StopCategory(Base):
    __tablename__ = "stop_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="staff")
    is_active = Column(Boolean, default=True)
    email = Column(String, unique=True, nullable=True)
    google_sub = Column(String, unique=True, nullable=True)
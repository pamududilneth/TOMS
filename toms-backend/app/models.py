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

    status = Column(String, default="submitted")  # draft | submitted
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
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
    location = Column(String, nullable=True)  # where the breakdown/accident happened
    reason = Column(String, nullable=True)

    image_filename = Column(String, nullable=True)

    action_taken = Column(String, nullable=True)
    priority = Column(String, default="High Intervention")

    status = Column(String, default="submitted")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="staff")  # "admin" | "staff"
    is_active = Column(Boolean, default=True)
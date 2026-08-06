from app.database import SessionLocal, Base, engine
from app import models

Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Replace these with your actual clients and coordinators
clients = [
    "Acme Logistics",
    "Bluewave Freight",
    "Coastal Distributors",
]

coordinators = [
    ("Priya Fernando", "+94 77 123 4567"),
    ("Nadeesha Perera", "+94 71 987 6543"),
]

for name in clients:
    if not db.query(models.Client).filter(models.Client.name == name).first():
        db.add(models.Client(name=name))

for name, mobile in coordinators:
    if not db.query(models.Coordinator).filter(models.Coordinator.name == name).first():
        db.add(models.Coordinator(name=name, mobile_number=mobile))

db.commit()
db.close()

print("Seed data inserted.")
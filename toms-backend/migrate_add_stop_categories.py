from app.database import SessionLocal, Base, engine
from app import models

Base.metadata.create_all(bind=engine)

db = SessionLocal()

defaults = [
    "Unplanned Stops",
    "Cargo Waiting Destination Access",
    "Traffic",
    "Vehicle Breakdown",
    "Other",
]

for name in defaults:
    if not db.query(models.StopCategory).filter(models.StopCategory.name == name).first():
        db.add(models.StopCategory(name=name))

db.commit()
db.close()
print("Stop categories seeded.")
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import incidents, stats, reference, breakdowns

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TOMS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(incidents.router)
app.include_router(stats.router)
app.include_router(reference.router)
app.include_router(breakdowns.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
"""
Medico.AI — FastAPI backend
"""
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database.db import init_db
from backend.routes.upload import router as upload_router
from backend.routes.medicines import router as medicines_router

app = FastAPI(
    title="Medico.AI API",
    description="AI-powered prescription decoder & generic medicine cost optimizer for India",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router, prefix="/api/v1", tags=["Upload & OCR"])
app.include_router(medicines_router, prefix="/api/v1", tags=["Medicines"])


@app.on_event("startup")
def startup():
    try:
        init_db()
        print("[Medico.AI] Database initialized successfully.")
    except Exception as e:
        print(f"[Medico.AI] ERROR during database init: {e}")
        import traceback
        traceback.print_exc()
        raise



@app.get("/health")
def health():
    """Full health check including database status."""
    from backend.database.db import Medicine, SessionLocal

    db = SessionLocal()
    try:
        medicine_count = db.query(Medicine).count()
        return {
            "status": "ok",
            "service": "Medico.AI",
            "database": "connected",
            "medicines_in_db": medicine_count
        }
    except Exception as e:
        return {
            "status": "error",
            "service": "Medico.AI",
            "database": "disconnected",
            "error": str(e)
        }
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=True)

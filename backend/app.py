"""
Medico.AI — FastAPI backend
"""
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

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


@app.get("/", response_class=HTMLResponse, include_in_schema=False)
def home():
    return """
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Medico.AI API</title>
        <style>
          body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            font-family: Arial, sans-serif;
            background: #f7f9fc;
            color: #172033;
          }
          main {
            width: min(720px, calc(100% - 32px));
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 32px;
            box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
          }
          h1 { margin: 0 0 8px; font-size: 32px; }
          p { color: #4b5563; line-height: 1.55; }
          nav { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
          a {
            color: white;
            background: #16a34a;
            text-decoration: none;
            border-radius: 6px;
            padding: 10px 14px;
            font-weight: 700;
          }
          a.secondary { background: #2563eb; }
        </style>
      </head>
      <body>
        <main>
          <h1>Medico.AI API</h1>
          <p>
            The FastAPI backend is deployed successfully. Use the API docs to
            test prescription upload, medicine search, and health endpoints.
          </p>
          <nav>
            <a href="/docs">Open API Docs</a>
            <a class="secondary" href="/health">Health Check</a>
            <a class="secondary" href="/api/v1/categories">Categories</a>
          </nav>
        </main>
      </body>
    </html>
    """


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

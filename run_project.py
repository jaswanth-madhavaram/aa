#!/usr/bin/env python3
"""
run_project.py — Comprehensive startup with full validation.
Ensures venv, dependencies, database, and services all start correctly.
"""
import subprocess
import sys
import os
import platform
import time
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
VENV_DIR = ROOT / "venv"
LOG_FILE = ROOT / "startup.log"

def log(msg):
    """Log to both console and file."""
    print(msg)
    with open(LOG_FILE, "a") as f:
        f.write(msg + "\n")

def log_section(title):
    """Log a section header."""
    msg = f"\n{'='*60}\n  {title}\n{'='*60}"
    log(msg)

# Clear old log
LOG_FILE.write_text("")

log_section("MEDICO.AI — COMPREHENSIVE STARTUP")
log(f"Project root: {ROOT}")
log(f"Python: {sys.executable}")
log(f"Platform: {platform.system()}")

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1: Verify/Create venv
# ─────────────────────────────────────────────────────────────────────────────

log_section("STEP 1: Virtual Environment")

def get_venv_python():
    candidates = [
        VENV_DIR / "Scripts" / "python.exe",
        VENV_DIR / "bin" / "python",
    ]
    for c in candidates:
        if c.exists():
            return str(c)
    return None

venv_python = get_venv_python()

if venv_python:
    log(f"✓ venv found: {venv_python}")
else:
    log("✗ venv not found or incompatible")
    if VENV_DIR.exists():
        log(f"  Removing old venv at {VENV_DIR}...")
        shutil.rmtree(VENV_DIR)
    log(f"  Creating new venv at {VENV_DIR}...")
    res = subprocess.run([sys.executable, "-m", "venv", str(VENV_DIR)], capture_output=True, text=True)
    if res.returncode != 0:
        log(f"✗ FAILED to create venv: {res.stderr}")
        sys.exit(1)
    venv_python = get_venv_python()
    if not venv_python:
        log(f"✗ venv created but python not found")
        sys.exit(1)
    log(f"✓ New venv created: {venv_python}")

# ─────────────────────────────────────────────────────────────────────────────
# STEP 2: Install dependencies
# ─────────────────────────────────────────────────────────────────────────────

log_section("STEP 2: Dependencies")

log("Upgrading pip...")
res = subprocess.run([venv_python, "-m", "pip", "install", "--upgrade", "pip"], capture_output=True, text=True)
if res.returncode != 0:
    log(f"⚠ pip upgrade had issues: {res.stderr[:200]}")

req_file = ROOT / "requirements.txt"
if not req_file.exists():
    log(f"✗ requirements.txt not found at {req_file}")
    sys.exit(1)

log(f"Installing from {req_file}...")
res = subprocess.run([venv_python, "-m", "pip", "install", "-r", str(req_file)], capture_output=True, text=True)
if res.returncode != 0:
    log(f"✗ pip install failed: {res.stderr[:500]}")
    sys.exit(1)
log("✓ Dependencies installed")

# ─────────────────────────────────────────────────────────────────────────────
# STEP 3: Verify key packages
# ─────────────────────────────────────────────────────────────────────────────

log_section("STEP 3: Package Verification")

required_packages = ["fastapi", "uvicorn", "streamlit", "pandas", "sqlalchemy"]
for pkg in required_packages:
    res = subprocess.run([venv_python, "-c", f"import {pkg}"], capture_output=True, text=True)
    if res.returncode == 0:
        log(f"✓ {pkg}")
    else:
        log(f"✗ {pkg} missing!")
        sys.exit(1)

# ─────────────────────────────────────────────────────────────────────────────
# STEP 4: Verify data files
# ─────────────────────────────────────────────────────────────────────────────

log_section("STEP 4: Data Files")

data_file = ROOT / "data" / "medicines.csv"
if data_file.exists():
    log(f"✓ medicines.csv found")
else:
    log(f"✗ medicines.csv NOT found at {data_file}")
    sys.exit(1)

# ─────────────────────────────────────────────────────────────────────────────
# STEP 5: Test database initialization
# ─────────────────────────────────────────────────────────────────────────────

log_section("STEP 5: Database Test")

test_db_script = """
import sys, os
sys.path.insert(0, {!r})
from backend.database.db import init_db
try:
    init_db()
    print("DB_OK")
except Exception as e:
    print(f"DB_ERROR: {{e}}")
    import traceback
    traceback.print_exc()
""".format(str(ROOT))

res = subprocess.run([venv_python, "-c", test_db_script], capture_output=True, text=True, cwd=str(ROOT))
if "DB_OK" in res.stdout:
    log("✓ Database initialization successful")
else:
    log(f"✗ Database initialization failed")
    log(f"  stdout: {res.stdout}")
    log(f"  stderr: {res.stderr}")
    sys.exit(1)

# ─────────────────────────────────────────────────────────────────────────────
# STEP 6: Start services
# ─────────────────────────────────────────────────────────────────────────────

log_section("STEP 6: Starting Services")

log("Starting backend (Uvicorn on :8000)...")
backend_proc = subprocess.Popen(
    [venv_python, "-m", "uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000"],
    cwd=str(ROOT),
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True,
    bufsize=1,
)

time.sleep(3)

log("Starting frontend (Streamlit on :8501)...")
frontend_proc = subprocess.Popen(
    [venv_python, "-m", "streamlit", "run", "frontend/app.py", "--server.port", "8501", "--server.address", "0.0.0.0"],
    cwd=str(ROOT),
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True,
    bufsize=1,
)

time.sleep(3)

# ─────────────────────────────────────────────────────────────────────────────
# STEP 7: Health checks
# ─────────────────────────────────────────────────────────────────────────────

log_section("STEP 7: Health Checks")

# Check if processes are alive
if backend_proc.poll() is None:
    log("✓ Backend process running")
else:
    log("✗ Backend process crashed")
    sys.exit(1)

if frontend_proc.poll() is None:
    log("✓ Frontend process running")
else:
    log("✗ Frontend process crashed")
    sys.exit(1)

# Try to reach backend API
import urllib.request
import urllib.error
time.sleep(2)

try:
    resp = urllib.request.urlopen("http://localhost:8000/health", timeout=5)
    if resp.status == 200:
        log("✓ Backend API responding at http://localhost:8000/health")
    else:
        log(f"⚠ Backend API returned {resp.status}")
except urllib.error.URLError as e:
    log(f"⚠ Backend API not yet responding: {e}")

# ─────────────────────────────────────────────────────────────────────────────
# READY
# ─────────────────────────────────────────────────────────────────────────────

log_section("✓ ALL SYSTEMS READY")
log(f"""
📊 Frontend (Streamlit UI)
   → http://localhost:8501

🔌 Backend API
   → http://localhost:8000
   → http://localhost:8000/docs (Swagger UI)

📋 Logs
   → {LOG_FILE}

Press Ctrl+C to stop all services.
""")

# Keep processes alive
try:
    while True:
        if backend_proc.poll() is not None:
            log("✗ Backend process died")
            break
        if frontend_proc.poll() is not None:
            log("✗ Frontend process died")
            break
        time.sleep(1)
except KeyboardInterrupt:
    log("\nShutting down...")
    backend_proc.terminate()
    frontend_proc.terminate()
    time.sleep(2)
    backend_proc.kill()
    frontend_proc.kill()
    log("✓ Services stopped")

#!/usr/bin/env python3
"""
start.py — Start both backend and frontend with a single command.
Usage:  python start.py
"""
import subprocess
import sys
import os
import platform
import time
import threading
import shutil

ROOT = os.path.dirname(os.path.abspath(__file__))
VENV_DIR = os.path.join(ROOT, "venv")


def get_project_python() -> str:
    candidates = [
        os.path.join(VENV_DIR, "Scripts", "python.exe"),
        os.path.join(VENV_DIR, "bin", "python"),
    ]
    for candidate in candidates:
        if os.path.exists(candidate):
            return candidate
    return sys.executable


def ensure_venv_and_deps():
    """Ensure venv exists and dependencies are installed."""
    python_exe = get_project_python()
    
    # If the venv doesn't have a valid python, remove it and recreate
    if python_exe == sys.executable:
        if os.path.exists(VENV_DIR):
            print("[start.py] Removing incompatible venv...")
            try:
                shutil.rmtree(VENV_DIR)
            except Exception as e:
                print(f"[start.py] Warning: Could not remove venv: {e}")
        print("[start.py] Creating new venv...")
        res = subprocess.run([sys.executable, "-m", "venv", VENV_DIR])
        if res.returncode != 0:
            print("[start.py] ERROR: Failed to create venv")
            sys.exit(1)
        python_exe = get_project_python()
    
    # Install/upgrade dependencies
    print("[start.py] Checking dependencies...")
    subprocess.run([python_exe, "-m", "pip", "install", "--upgrade", "pip"], check=False)
    req_file = os.path.join(ROOT, "requirements.txt")
    res = subprocess.run([python_exe, "-m", "pip", "install", "-r", req_file])
    if res.returncode != 0:
        print("[start.py] WARNING: Some packages failed to install")
    
    return python_exe


PYTHON = ensure_venv_and_deps()
print(f"[start.py] Using Python interpreter: {PYTHON}")


def stream(proc, label):
    for line in proc.stdout:
        print(f"[{label}] {line}", end="")


def main():
    print("=" * 60)
    print("  Medico.AI — Starting up")
    print("=" * 60)

    backend = subprocess.Popen(
        [PYTHON, "-m", "uvicorn", "backend.app:app",
         "--host", "0.0.0.0", "--port", "8000", "--reload"],
        cwd=ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )

    t_back = threading.Thread(target=stream, args=(backend, "API"), daemon=True)
    t_back.start()

    print("[start.py] Waiting for backend to initialise…")
    time.sleep(4)

    frontend = subprocess.Popen(
        [PYTHON, "-m", "streamlit", "run", "frontend/app.py",
         "--server.port", "8501", "--server.address", "0.0.0.0"],
        cwd=ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )

    t_front = threading.Thread(target=stream, args=(frontend, "UI"), daemon=True)
    t_front.start()

    print()
    print("=" * 60)
    print("  ✅  Medico.AI is running!")
    print("  📊  UI  →  http://localhost:8501")
    print("  🔌  API →  http://localhost:8000/docs")
    print("  Press Ctrl+C to stop.")
    print("=" * 60)

    try:
        backend.wait()
        frontend.wait()
    except KeyboardInterrupt:
        print("\n[start.py] Shutting down…")
        backend.terminate()
        frontend.terminate()


if __name__ == "__main__":
    main()

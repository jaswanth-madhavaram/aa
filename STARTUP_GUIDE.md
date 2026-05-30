# 🚀 Medico.AI — Complete Startup Guide

## Quick Start (Recommended)

### **Option 1: One-Click Windows Start (EASIEST)**
1. Navigate to: `c:\Users\Venkat Arunn Reddy\Downloads\medico-ai\medico-ai\`
2. **Double-click:** `RUN_PROJECT.bat`
3. Wait ~30-60 seconds for services to start
4. Open browser: `http://localhost:8501` (Streamlit frontend)

**The script will automatically:**
- ✓ Create/fix Python virtual environment
- ✓ Install all dependencies (FastAPI, Streamlit, pandas, etc.)
- ✓ Verify packages are importable
- ✓ Check medicines.csv data file
- ✓ Initialize SQLite database
- ✓ Start FastAPI backend (port 8000)
- ✓ Start Streamlit frontend (port 8501)
- ✓ Perform health checks

---

### **Option 2: Windows Command Prompt**
1. Open **Windows Command Prompt** (cmd.exe)
2. Navigate to project:
   ```cmd
   cd C:\Users\Venkat Arunn Reddy\Downloads\medico-ai\medico-ai
   ```
3. Run:
   ```cmd
   python run_project.py
   ```
4. Wait for both services to start, then visit: `http://localhost:8501`

---

### **Option 3: PowerShell**
```powershell
cd C:\Users\Venkat Arunn Reddy\Downloads\medico-ai\medico-ai
python run_project.py
```

---

## ✨ What Happens During Startup

The `run_project.py` script runs 7 validation steps:

```
Step 1: Virtual Environment
├─ Detect Windows venv at venv/Scripts/python.exe
├─ If missing/broken → Remove old venv
└─ Create fresh venv via python -m venv

Step 2: Dependencies
├─ Upgrade pip via: python -m pip install --upgrade pip
└─ Install all packages: python -m pip install -r requirements.txt

Step 3: Package Verification
├─ Import test: fastapi ✓
├─ Import test: uvicorn ✓
├─ Import test: streamlit ✓
├─ Import test: pandas ✓
└─ Import test: sqlalchemy ✓

Step 4: Data Files
├─ Check: data/medicines.csv exists
└─ Size: ~100+ medicine entries (brands + prices)

Step 5: Database Test
├─ Run: backend.database.init_db()
├─ Create SQLite at: medico.db
├─ Seed medicines from CSV
└─ Result: ~1000+ medicine records loaded

Step 6: Service Startup
├─ Backend: uvicorn backend.app:app --port 8000 --reload
└─ Frontend: streamlit run frontend/app.py --server.port 8501

Step 7: Health Checks
├─ Wait for backend to respond
├─ Verify frontend is ready
├─ Test GET http://localhost:8000/health
└─ Display service URLs
```

---

## 🌐 Access the Application

**Frontend (Main UI):**
- 🔗 `http://localhost:8501`
- Upload prescriptions or search medicines
- See price comparisons & alternatives

**Backend API Docs:**
- 🔗 `http://localhost:8000/docs` (Swagger UI)
- 🔗 `http://localhost:8000/redoc` (ReDoc)

**Backend Health:**
- 🔗 `http://localhost:8000/health` (JSON status)

---

## 🛑 Stopping the Project

### **From CMD/PowerShell:**
- Press: `Ctrl + C` (twice if needed)
- Script will gracefully shut down both services

### **Manual Cleanup:**
```cmd
# Kill FastAPI backend
taskkill /F /IM python.exe

# Or stop Streamlit
taskkill /F /FI "WINDOWTITLE eq streamlit*"
```

---

## 🔧 Troubleshooting

### **1. "Python not found" or "ModuleNotFoundError"**
**Solution:** The script should auto-fix this. If not:
```cmd
cd C:\Users\Venkat Arunn Reddy\Downloads\medico-ai\medico-ai
python -m venv venv
venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

### **2. "Cannot connect to backend" in frontend**
**Check:**
- Is backend running on port 8000?
- Look at terminal output for errors
- Restart: `python run_project.py`

### **3. Port 8000 or 8501 already in use**
**Solution:** Kill existing process or change port in frontend/app.py:
```python
st.set_page_config(...) # Around line 10
```

### **4. "medicines.csv not found"**
**Check:** File exists at `data/medicines.csv`
- Size should be ~100KB
- Contains brand names, prices, generics

### **5. Database errors**
**Solution:** Delete `medico.db` and restart (re-seeds from CSV)
```cmd
del medico.db
python run_project.py
```

---

## 📁 Project Structure

```
medico-ai/
├── RUN_PROJECT.bat           ← CLICK THIS to start
├── run_project.py            ← Startup script (Step 1-7 validation)
├── start.py                  ← Alternative launcher
├── requirements.txt          ← All dependencies
│
├── backend/                  ← FastAPI server
│   ├── app.py               ← Main API app
│   ├── routes/
│   │   ├── upload.py        ← POST /upload (OCR)
│   │   └── medicines.py     ← GET /medicines/* (search)
│   ├── services/
│   │   ├── ocr.py           ← OCR engine (Claude Vision → Tesseract → EasyOCR)
│   │   ├── nlp.py           ← Extract medicine names
│   │   └── matcher.py       ← Fuzzy match & price comparison
│   └── database/
│       └── db.py            ← SQLAlchemy models + seeding
│
├── frontend/                 ← Streamlit UI
│   └── app.py               ← Multi-page app (Upload, Search, Browse)
│
├── data/
│   └── medicines.csv        ← Medicine database (brands + prices)
│
└── medico.db                ← SQLite database (auto-created)
```

---

## 📊 Key Features (Once Running)

### **1. Upload Prescription (OCR)**
- 📸 Upload JPG/PNG/WebP prescription image
- 🤖 AI extracts medicine names automatically
- 💰 Shows price comparisons for each medicine
- 📋 Saves to search history

### **2. Manual Text Search**
- ✏️ Type or paste prescription text
- 🔍 Extracts medicine names via NLP
- 💰 Ranks alternatives by price

### **3. Search Single Medicine**
- 🔍 Look up any brand name (e.g., "Crocin")
- 💊 Find generic equivalents
- 💵 Compare prices and savings percentage
- 🏥 Check Jan Aushadhi store prices (when available)

### **4. Browse Database**
- 📊 Browse all ~1000+ medicines
- 🔎 Filter by category or search term
- 📋 View full details (manufacturer, salt, unit type)

---

## 🎯 Expected Results After First Run

✅ **Backend starts successfully:**
```
INFO: Uvicorn running on http://0.0.0.0:8000
```

✅ **Frontend loads:**
```
You can now view your Streamlit app in your browser.
Local URL: http://localhost:8501
```

✅ **Try a quick search:**
- Visit: `http://localhost:8501`
- Go to "🔍 Search Medicine"
- Enter: `Crocin`
- See: "Crocin 500mg" with 4-5 cheaper alternatives (Paracip, Metacin, etc.)

✅ **Database works:**
- Sidebar shows: "🟢 Backend Online (1000+ medicines loaded)"

---

## 📞 Support

If services don't start:
1. Check `startup.log` in the project folder
2. Run manually step-by-step (see Terminal Commands section)
3. Verify requirements.txt is not corrupted

**startup.log example:**
```
[✓] Step 1: Virtual Environment — Created at venv/
[✓] Step 2: Dependencies — Installed fastapi, uvicorn, streamlit, ...
[✓] Step 3: Package Verification — All imports successful
[✓] Step 4: Data Files — medicines.csv found (120 rows)
[✓] Step 5: Database — Seeded 1205 medicines from CSV
[✓] Step 6: Services Starting — Backend on :8000, Frontend on :8501
[✓] Step 7: Health Checks — All services responding
```

---

**Last Updated:** 2024
**Project:** Medico.AI — Smart Medicine Cost Optimizer for India
